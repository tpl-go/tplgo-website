import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");

test("AdminWebsiteExperienceLanding uses the approved compact home sections", () => {
  expect(source).toContain("Content");
  expect(source).toContain('title="Global Experience"');
  expect(source).toContain('title="Pages"');
  expect(source).toContain("Work Queue");
  expect(source).toContain('title="Drafts"');
  expect(source).toContain('title="Needs Approval"');
  expect(source).toContain('title="Ready to Publish"');
  expect(source).toContain('title="Scheduled"');
  expect(source).toContain("Records");
  expect(source).toContain('title="Published Content"');
  expect(source).toContain('title="Archive"');
  expect(source).toContain('title="Versions & Audit"');
});

test("AdminWebsiteExperienceLanding keeps the home copy human-friendly and removes diagnostic language", () => {
  expect(source).toContain("Manage website content and publishing.");
  expect(source).toContain("Choose what you want to manage.");
  expect(source).toContain("Continue or review pending changes.");
  expect(source).toContain("View published content and change history.");
  expect(source).not.toContain("S4D6.2");
  expect(source).not.toContain("Presentation only");
  expect(source).not.toContain("Global Experience / Pages");
  expect(source).not.toContain("certified Website Experience engine");
  expect(source).not.toContain("security, service policy, payments, providers");
});

test("AdminWebsiteExperienceLanding preserves existing destination mapping from human labels to workflow routes", () => {
  expect(source).toContain('title="Needs Approval"');
  expect(source).toContain('href="/admin/website-experience/login-signup?workflow=in_review"');
  expect(source).toContain('title="Ready to Publish"');
  expect(source).toContain('href="/admin/website-experience/login-signup?workflow=approved"');
  expect(source).toContain('title="Published Content"');
  expect(source).toContain('href="/admin/website-experience/login-signup?workflow=published"');
});

test("AdminWebsiteExperienceLanding keeps navigation rows vertical and full-width instead of a grid", () => {
  expect(source).toContain("VerticalEntry");
  expect(source).toContain("w-full");
  expect(source).not.toContain("grid-cols");
});

test("AdminWebsiteExperienceLanding keeps loading and error states usable", () => {
  expect(source).toContain("Some counts could not load. Navigation is still available.");
  expect(source).toContain("Retry");
  expect(source).toContain("Loading");
});
