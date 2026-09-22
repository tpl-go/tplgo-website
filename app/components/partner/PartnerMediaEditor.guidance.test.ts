import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = readFileSync(join(process.cwd(), "app/components/partner/PartnerMediaEditor.tsx"), "utf8");

test("media library explains repeat uploads and least-privilege review truthfully", () => {
  expect(source).toContain("Pending TPL review");
  expect(source).toContain("Partner media reviewer role");
  expect(source).toContain("Every decision requires confirmation");
  expect(source).toContain("Review reason");
  expect(source).toContain("Open customer gallery preview");
  expect(source).toContain("Build the gallery one image at a time.");
  expect(source).toContain("Add another image or video");
  expect(source).toContain("Image file · one per upload");
  expect(source).toContain("media slots remain");
});
