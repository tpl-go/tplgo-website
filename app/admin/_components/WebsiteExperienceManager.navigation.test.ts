import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");

test("WebsiteExperienceManager maps workflow queues to human-facing labels", () => {
  expect(source).toContain('{ key: "drafts", label: "Drafts"');
  expect(source).toContain('{ key: "in_review", label: "Needs Approval"');
  expect(source).toContain('{ key: "approved", label: "Ready to Publish"');
  expect(source).toContain('{ key: "scheduled", label: "Scheduled"');
  expect(source).toContain('{ key: "published", label: "Published Content"');
  expect(source).toContain('{ key: "archive", label: "Archive"');
  expect(source).toContain('{ key: "versions", label: "Versions & Audit"');
  expect(source).not.toContain('label: "In Review"');
  expect(source).not.toContain('label: "Approved"');
  expect(source).not.toContain('label: "Published"');
});

test("WebsiteExperienceManager workflow lists use explicit Website Experience parent navigation", () => {
  expect(source).toContain('backLabel="Back to Website Experience"');
  expect(source).toContain('backHref="/admin/website-experience"');
  expect(source).toContain("<WorkflowBreadcrumb current={selected.label} />");
  expect(source).toContain('<Link href="/admin/website-experience"');
  expect(source).not.toContain("router.back");
});

test("WebsiteExperienceManager preserves workflow record origin for deterministic detail back navigation", () => {
  expect(source).toContain("const [workflowOrigin, setWorkflowOrigin]");
  expect(source).toContain("setWorkflowOrigin(view)");
  expect(source).toContain("onOpen(row.context, view)");
  expect(source).toContain("onPreview(row.context, view)");
  expect(source).toContain("Back to ${workflowViewLabel(workflowOrigin)}");
  expect(source).toContain("workflowOrigin ? () =>");
});

test("WebsiteExperienceManager queue detail breadcrumbs link to the exact originating queue URL", () => {
  expect(source).toContain('workflowOrigin && mode === "login-signup"');
  expect(source).toContain("workflowViewLabel(workflowOrigin)");
  expect(source).toContain('href={`/admin/website-experience/login-signup?workflow=${workflowOrigin}`}');
  expect(source).toContain('aria-current="page"');
});
