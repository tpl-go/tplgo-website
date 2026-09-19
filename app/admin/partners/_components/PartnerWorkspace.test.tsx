import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { ApplicationMetrics, PartnerAvailability } from "./PartnerOverview";
import { ApplicationQueue, applicationDetailHref, createQaState } from "../applications/AdminPartnerApplicationsClient";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));

test("application metrics display server counts without implying active Partners", () => {
  const html = renderToStaticMarkup(createElement(ApplicationMetrics, { counts: { SUBMITTED: 12, UNDER_REVIEW: 3, APPROVED: 2 } }));
  expect(html).toContain(">12</p>");
  expect(html).toContain("Approved applications");
  expect(html).toContain("status=CHANGES_REQUESTED");
  expect(html).not.toContain("Active Partners");
});

test("operational directory does not assert empty, active or financial results", () => {
  const html = renderToStaticMarkup(createElement(PartnerAvailability, { activeOnly: true }));
  expect(html).toContain("Activation data unavailable");
  expect(html).toContain("Financial reports");
  expect(html).not.toContain("No active Partners");
  expect(html).not.toContain("<button");
  expect(html).not.toContain("₹");
});

test("each application renders one full-row accessible link to its own dashboard", () => {
  const rows = createQaState().queue.rows.slice(0, 2);
  const html = renderToStaticMarkup(createElement(ApplicationQueue, { rows, selectedId: "", qa: true, query: "status=SUBMITTED&service=Hotel" }));
  expect(html.match(/<a /g)).toHaveLength(2);
  for (const row of rows) expect(html).toContain(`/admin/partners/applications/${row.submissionId}?status=SUBMITTED&amp;service=Hotel&amp;qa=1`);
  expect(html).not.toContain("<button");
  expect(html).not.toContain("Approve final application");
});

test("detail route preserves safe filters and drops record selectors/private query parameters", () => {
  expect(applicationDetailHref("fixture/a", "status=SUBMITTED&service=Hotel&submission=wrong&token=private&returnTo=https://example.test", false))
    .toBe("/admin/partners/applications/fixture%2Fa?status=SUBMITTED&service=Hotel");
});
