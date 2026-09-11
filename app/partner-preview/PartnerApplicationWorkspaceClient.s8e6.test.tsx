import { isValidElement, type ReactNode, type ReactElement } from "react";
import { expect, test, vi } from "vitest";
import { MobileStepSelector, StepNavigator } from "./PartnerApplicationWorkspaceClient";
import { buildPartnerQaPreviewReadiness } from "../lib/partner/partnerQaPreviewFixtures";

vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
type ControlProps = { children?: ReactNode; disabled?: boolean; onClick?: () => void; onChange?: (event: { target: { value: string } }) => void; "data-application-step-button"?: string };
function nodes(node: ReactNode): ReactElement<ControlProps>[] {
  if (Array.isArray(node)) return node.flatMap(nodes);
  if (!isValidElement<ControlProps>(node)) return [];
  return [node, ...nodes(node.props.children)];
}
test("future step pointer/keyboard activation cannot call navigation, even in QA", () => {
  for (const qaPreviewEnabled of [false, true]) {
    const readiness = buildPartnerQaPreviewReadiness("new");
    readiness.steps = readiness.steps.map((step) => ({ ...step, status: "NEEDS_ATTENTION", blockerCodes: ["INCOMPLETE"] }));
    let calls = 0;
    const props: Parameters<typeof StepNavigator>[0] = { activeStep: "account_contact", readModel: { steps: [] } as unknown as Parameters<typeof StepNavigator>[0]["readModel"], readiness, qaPreviewEnabled, onSelect: () => { calls++; } };
    const controls = nodes(StepNavigator(props)).filter((node) => node.type === "button");
    expect(controls).toHaveLength(8);
    expect(controls.slice(1).every((node) => node.props.disabled)).toBe(true);
    for (const node of controls.slice(1)) node.props.onClick!();
    expect(calls).toBe(0);
    controls[0].props.onClick!();
    expect(calls).toBe(1);
    const select = nodes(MobileStepSelector(props)).find((node) => node.type === "select")!;
    select.props.onChange!({ target: { value: "documents_compliance" } });
    select.props.onChange!({ target: { value: "unknown" } });
    expect(calls).toBe(1);
    select.props.onChange!({ target: { value: "account_contact" } });
    expect(calls).toBe(2);
  }
});
