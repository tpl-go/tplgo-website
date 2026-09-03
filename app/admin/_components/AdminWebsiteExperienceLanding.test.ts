import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const source = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");

test("AdminWebsiteExperienceLanding uses the approved compact home sections", () => {
  expect(source).toContain("Content");
  expect(source).toContain('title="Global Experience"');
  expect(source).toContain('title="Pages"');
  expect(source).toContain("Work Queue");
  expect(source).toContain('title="Drafts"');
  expect(source).toContain('title="Service Requests"');
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
  expect(source).toContain('title="Service Requests"');
  expect(source).toContain('href="/admin/website-experience/service-requests"');
  expect(source).toContain('title="Published Content"');
  expect(source).toContain('href="/admin/website-experience/login-signup?workflow=published"');
  expect(source).toContain('href="/admin/website-experience/versions-audit"');
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

test("AdminWebsiteExperienceLanding global listing uses human-friendly copy and explicit parent navigation", () => {
  expect(source).toContain('current="Global Experience"');
  expect(source).toContain('title="Global Experience"');
  expect(source).toContain('detail="Manage content shared across the website."');
  expect(source).toContain('const backTarget = parent ?? { label: "Website Experience", href: "/admin/website-experience" };');
  expect(source).toContain('label={`Back to ${backTarget.label}`}');
  expect(source).toContain('href="/admin/website-experience" className="rounded text-sky-200');
  expect(source).toContain('title="Login & Signup"');
  expect(source).toContain('detail="Manage login and registration content."');
  expect(source).toContain('count="3 experiences"');
  expect(source).toContain('label: "Header & Navigation"');
  expect(source).toContain('description: "Manage website header and navigation content."');
  expect(source).toContain('label: "Footer"');
  expect(source).toContain('description: "Manage website footer content."');
  expect(source).toContain('label: "Global Notices"');
  expect(source).toContain('description: "Manage notices displayed across the website."');
  expect(source).toContain('count="Available soon"');
  expect(source).not.toContain("Registered global module");
  expect(source).not.toContain("Dynamic editing is not configured");
  expect(source).not.toContain("Future");
});

test("AdminWebsiteExperienceLanding pages listing uses human descriptions and preserves existing destinations", () => {
  expect(source).toContain('current="Pages"');
  expect(source).toContain('title="Pages"');
  expect(source).toContain('detail="Choose a page to manage its content."');
  expect(source).toContain('placeholder="Search pages"');
  expect(source).toContain('description: "Manage homepage sections."');
  expect(source).toContain('description: "Manage flight-page content."');
  expect(source).toContain('description: "Manage hotel-page content."');
  expect(source).toContain('description: "Manage Partner experience content."');
  expect(source).toContain('description: "Manage creator-page content."');
  expect(source).toContain('description: "Manage Smart Planner content."');
  expect(source).toContain('description: "Manage marketplace content."');
  expect(source).toContain('description: "Manage Local Life content."');
  expect(source).toContain('description: "Manage cab-page content."');
  expect(source).toContain('href={page.label === "Partner" ? "/admin/website-experience/pages/partner" : undefined}');
  expect(source).toContain('count={`${page.sections.length} sections`}');
  expect(source).not.toContain('detail={page.path}');
  expect(source).not.toContain("Open one registered page at a time.");
  expect(source).not.toContain("Search pages or routes");
});

test("AdminWebsiteExperienceLanding disabled listing rows are unavailable without active navigation affordance", () => {
  expect(source).toContain('aria-disabled="true"');
  expect(source).toContain('disabledHelp = "Editing for this area will be available soon."');
  expect(source).toContain('title={disabledHelp}');
  expect(source).toContain("disabled ? null : <ArrowRight");
});

test("AdminWebsiteExperienceLanding Partner third-level screen uses immediate-parent navigation and human copy", () => {
  expect(source).toContain('current="Partner"');
  expect(source).toContain('parent={{ label: "Pages", href: "/admin/website-experience/pages" }}');
  expect(source).toContain('title="Partner"');
  expect(source).toContain('detail="Choose a Partner area to manage."');
  expect(source).toContain('title="Partner Page" detail="Management for this area will be available soon." count="Available soon" disabled disabledHelp="Management for this area will be available soon."');
  expect(source).toContain('title="Partner Application" detail="Manage Partner onboarding content."');
  expect(source).toContain('title="Service Catalogue" detail="Manage Partner service domains and services."');
  expect(source).toContain('href="/admin/website-experience/pages/partner/application"');
  expect(source).toContain('href="/admin/website-experience/pages/partner/service-catalogue"');
  expect(source).not.toContain("authoritative Service Catalogue");
  expect(source).not.toContain("safe presentation fields");
  expect(source).not.toContain("Existing Partner landing/page safe presentation content.");
});

test("AdminWebsiteExperienceLanding Partner back and breadcrumbs use explicit clickable parent routes", () => {
  expect(source).toContain('const backTarget = parent ?? { label: "Website Experience", href: "/admin/website-experience" };');
  expect(source).toContain('<AdminBackButton href={backTarget.href} label={`Back to ${backTarget.label}`} />');
  expect(source).toContain('<BreadcrumbTrail current={current} parent={parent} />');
  expect(source).toContain('href="/admin/website-experience" className="rounded text-sky-200');
  expect(source).toContain('<Link href={parent.href} className="rounded text-sky-200');
  expect(source).toContain('<span aria-current="page" className="text-slate-300">{current}</span>');
  expect(source).not.toContain("router.back");
});

test("AdminWebsiteExperienceLanding Partner listing removes developer-facing language from rendered copy", () => {
  const forbiddenTerms = [
    "registered page",
    "registered Partner module",
    "Partner preview route",
    "runtime catalogue authority",
    "backend",
    "source",
    "schema",
    "dynamic configuration",
    "policy engine",
    "stable IDs",
    "stable service IDs",
    "DB-backed",
    "implementation batch",
    "API source",
    "frontend route",
    "/partner-preview",
    "staging fingerprint",
    "Future",
    "Not configured",
    "Missing module",
    "Editor unavailable",
    "Unsupported",
    "Development pending",
  ];

  const partnerBlock = source.slice(source.indexOf('if (view === "partner")'), source.indexOf('if (view === "root"'));
  for (const term of forbiddenTerms) {
    expect(partnerBlock).not.toContain(term);
  }
});

test("AdminWebsiteExperienceLanding disabled Partner items have no active navigation affordance", () => {
  expect(source).toContain('aria-disabled="true"');
  expect(source).toContain('title={disabledHelp}');
  expect(source).toContain('<span className="sr-only">{disabledHelp}</span>');
  expect(source).toContain("disabled ? null : <ArrowRight");
  expect(source).not.toContain("tabIndex={0}");
});

test("AdminWebsiteExperienceLanding Partner rows keep the approved vertical full-row layout", () => {
  expect(source).toContain("flex min-h-20 w-full flex-col justify-between gap-4");
  expect(source).toContain("sm:flex-row sm:items-center");
  expect(source).toContain("return <Link href={href} className={className}>{body}</Link>;");
  expect(source).not.toContain("grid grid-cols");
});

test("AdminWebsiteExperienceLanding route audit keeps undiscovered page third-level screens out of scope", () => {
  const pageRouteRoot = join(process.cwd(), "app/admin/website-experience/pages");
  expect(existsSync(join(pageRouteRoot, "partner/page.tsx"))).toBe(true);
  expect(existsSync(join(pageRouteRoot, "homepage/page.tsx"))).toBe(false);
  expect(existsSync(join(pageRouteRoot, "flights/page.tsx"))).toBe(false);
  expect(existsSync(join(pageRouteRoot, "hotels/page.tsx"))).toBe(false);
});
