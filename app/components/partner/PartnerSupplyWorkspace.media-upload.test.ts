import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = readFileSync(join(process.cwd(), "app/components/partner/PartnerSupplyWorkspace.tsx"), "utf8");

test("Website media upload uses the authenticated backend upload path before canonical confirmation", () => {
  expect(source).toContain("/media/upload`");
  expect(source).toContain("'X-TPL-Media-Upload-Session':session.uploadSessionId");
  expect(source).toContain("Authorization:`Bearer ${token}`");
  expect(source).toContain("'Content-Type':selected.type");
  expect(source).toContain("/media/confirm");
  expect(source).toContain("storageReference:session.storageReference");
  expect(source).toContain("Image saved privately as Pending TPL review.");
  expect(source).not.toContain("fetch(session.upload.url");
});
