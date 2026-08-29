import { resolveCurrentTplApiTarget } from "@/app/lib/api/apiTargetResolver";

export type PartnerRegistrationIntakeInput = {
  legalName: string;
  serviceMobileCountryCode: string;
  serviceMobile: string;
  businessEmail: string;
  primaryCategory: string;
  requestedServiceName?: string;
};

const API_TARGET = resolveCurrentTplApiTarget();

export async function createPartnerRegistrationIntake(input: PartnerRegistrationIntakeInput): Promise<void> {
  if (!API_TARGET.baseUrl) return;
  const response = await fetch(`${API_TARGET.baseUrl}/api/v1/partner/registration-intakes`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const payload = await safeJson(response);
    const message = payload?.error?.message || "Partner registration could not be saved.";
    throw new Error(message);
  }
}

async function safeJson(response: Response): Promise<{ error?: { message?: string } } | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
