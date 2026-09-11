import { isValidElement, type ReactNode, type ReactElement } from "react";
import { expect, test, vi } from "vitest";
import { SelectedServicesSummary } from "./PartnerApplicationWorkspaceClient";
import { buildPartnerQaPreviewReadiness } from "../lib/partner/partnerQaPreviewFixtures";
import { partnerStep8ReadOnlyStepOverrides } from "../lib/partner/partnerStep8Review";
import type { PartnerApplicationReadiness, PartnerApplicationStepKey } from "../lib/partner/partnerApiClient";
import type { PartnerServiceCatalogueItem } from "../lib/partner/partnerServiceCatalogRuntime";

vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

const hotel: PartnerServiceCatalogueItem = {
  id: "hotel", stableCode: "hotel", name: "Hotel", domain: "stay", shortDescription: "",
  icon: "Building2", displayOrder: 1, status: "active", published: true, countries: ["IN"],
  individualAllowed: true, organizationAllowed: true, applicationSelectable: true,
  serviceApprovalRequired: true, verificationProfileKey: "hotel", capabilities: [], aliases: [],
};
const items = [hotel, { ...hotel, id: "resort", stableCode: "resort", name: "Resort" }];
type ButtonProps = { children?: ReactNode; disabled?: boolean; onClick?: () => void; "aria-label"?: string };
function buttons(node: ReactNode): ReactElement<ButtonProps>[] {
  if (Array.isArray(node)) return node.flatMap(buttons);
  if (!isValidElement<ButtonProps>(node)) return [];
  return [...(node.type === "button" ? [node] : []), ...buttons(node.props.children)];
}

const matrix: { status: PartnerApplicationReadiness["applicationStatus"]; sections?: PartnerApplicationStepKey[]; locked: boolean }[] = [
  { status: "DRAFT_INCOMPLETE", locked: false },
  { status: "READY_TO_SUBMIT", locked: false },
  { status: "SUBMITTED", locked: true },
  { status: "UNDER_REVIEW", locked: true },
  { status: "RESUBMITTED", locked: true },
  { status: "APPROVED", locked: true },
  { status: "NOT_APPROVED", locked: true },
  { status: "CHANGES_REQUESTED", sections: ["verification_compliance"], locked: true },
  { status: "CHANGES_REQUESTED", sections: [], locked: true },
  { status: "CHANGES_REQUESTED", locked: true },
  { status: "CHANGES_REQUESTED", sections: ["services"], locked: false },
];

for (const row of matrix) {
  for (const viewport of ["desktop", "mobile"]) {
    test(`${viewport}: ${row.status} corrections=${String(row.sections)} guards real summary handlers`, () => {
      const readiness = buildPartnerQaPreviewReadiness("changes-required");
      readiness.applicationStatus = row.status;
      readiness.latestSubmission = { ...readiness.latestSubmission!, correctionSections: row.sections };
      readiness.steps = readiness.steps.map((step) => step.step === "services" ? { ...step, status: "COMPLETE" } : step);
      const readOnly = partnerStep8ReadOnlyStepOverrides(readiness).services === true;
      expect(readOnly).toBe(row.locked);
      let selected = ["hotel", "resort"];
      let edits = 0;
      const render = () => SelectedServicesSummary({
        readOnly, headingId: `selected-services-summary-${viewport}`, countryCode: "IN", businessType: "company",
        form: { selectedServiceCodes: selected, requestedServices: [], requestPanelOpen: false },
        serviceCatalogueItems: items, serviceCatalog: [], legacyScopes: [],
        onEditDomain: () => { edits += 1; },
        onRemoveDomain: () => { selected = []; },
        onRemoveService: (item) => { selected = selected.filter((code) => code !== item.stableCode); },
      });
      const controls = buttons(render());
      expect(controls).toHaveLength(4);
      expect(controls.every((button) => button.props.disabled === row.locked)).toBe(true);
      controls.find((button) => button.props["aria-label"] === "Remove Hotel")!.props.onClick!();
      expect(selected).toEqual(row.locked ? ["hotel", "resort"] : ["resort"]);
      controls.find((button) => button.props.children === "Edit")!.props.onClick!();
      expect(edits).toBe(row.locked ? 0 : 1);
      controls.find((button) => button.props.children === "Remove")!.props.onClick!();
      expect(selected).toEqual(row.locked ? ["hotel", "resort"] : []);
      expect(buttons(render()).every((button) => button.props.disabled === row.locked)).toBe(true);
    });
  }
}
