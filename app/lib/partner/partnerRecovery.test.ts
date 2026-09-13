import { test, expect, vi } from "vitest";
import { tplApiRequest } from "../api/tplApiClient";
import { completeRecovery, RecoveryError, startRecovery, verifyRecovery } from "./partnerRecovery";
vi.mock("../api/tplApiClient",()=>({tplApiRequest:vi.fn()}));
const request=vi.mocked(tplApiRequest) as typeof tplApiRequest & { mockClear: () => void; mockResolvedValueOnce: (value: Awaited<ReturnType<typeof tplApiRequest>>) => void };
const challenge="00000000-0000-4000-8000-000000000001";
function response(data:unknown){return {ok:true,data,status:200,requestId:"test",meta:{requestId:"test",apiVersion:"v1"}} as Awaited<ReturnType<typeof tplApiRequest>>;}
  for (const channel of ["mobile","email"] as const) test(`sends ${channel} recovery identifiers in a POST body only`,async()=>{
    request.mockClear();
    request.mockResolvedValueOnce(response({accepted:true,challenge,expiresAt:"2030-01-01T00:05:00Z",resendAvailableAt:"2030-01-01T00:01:00Z"}));
    const contact=channel==="mobile"?"+999123456789":"old@example.test";
    expect((await startRecovery(channel,contact)).challenge).toBe(challenge);
    expect(request).toHaveBeenCalledWith("/api/v1/partner/recovery/start",{method:"POST",body:{channel,contact},fallbackOnError:false});
  });
  test("accepts only operator-safe confirmation fields",async()=>{
    request.mockResolvedValueOnce(response({displayName:"Example Business",statusLabel:"Application in progress",reference:null,organizationId:"hidden"}));
    expect(await verifyRecovery(challenge,"123456")).toEqual({displayName:"Example Business",statusLabel:"Application in progress",reference:null});
    request.mockResolvedValueOnce(response({displayName:"Example Business",statusLabel:"DRAFT_INCOMPLETE",reference:null}));
    await expect(verifyRecovery(challenge,"123456")).rejects.toBeInstanceOf(RecoveryError);
  });
  test("takes the completion destination only from the authoritative response",async()=>{
    request.mockResolvedValueOnce(response({session:{token:"test-session",expiresAt:"2030-01-01T00:05:00Z"},access:{outcome:"APPLICATION",organizationId:challenge,step:"business_identity"}}));
    expect((await completeRecovery(challenge)).access.step).toBe("business_identity");
    request.mockResolvedValueOnce(response({session:null,access:{outcome:"UNKNOWN",organizationId:null,step:null}}));
    await expect(completeRecovery(challenge)).rejects.toThrow();
  });
  for (const status of [400,401,409,429,503]) test(`does not expose raw errors (${status})`,async()=>{
    request.mockResolvedValueOnce({ok:false,status,error:{message:"private-database-detail",code:"INTERNAL_PRIVATE"}} as Awaited<ReturnType<typeof tplApiRequest>>);
    await expect(startRecovery("email","old@example.test")).rejects.not.toThrow("private-database-detail");
  });
  test("cooldown and provider-unavailable errors do not claim dispatch", () => {
    expect(new RecoveryError(429).message).toContain("does not confirm that a code was sent");
    expect(new RecoveryError(503).message).toContain("Try again later or contact Partner Support");
  });
