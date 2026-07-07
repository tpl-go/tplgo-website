"use client";

import { useMemo, useState } from "react";

import {
  clearSmartPlannerDiagnosticTempStorage,
  diagnoseSmartPlannerBookingFlow,
  type PlannerFieldComparison,
  type PlannerFlowIssue,
  type PlannerSnapshotStage,
  type PlannerStorageSnapshot,
  type SmartPlannerFlowDiagnostic,
} from "@/app/lib/ecosystem/planner/booking/smartPlannerFlowDiagnostics";

const stageLabels: Record<PlannerSnapshotStage, string> = {
  chunkedDetail: "Chunked Detail",
  confirmation: "Confirmation",
  manageResolver: "Manage Resolver",
  myBookingCard: "My Booking Card",
  payment: "Payment",
  review: "Review",
  viewDetailResolver: "View Detail Resolver",
  workspace: "Workspace",
};

const stageOrder: PlannerSnapshotStage[] = [
  "workspace",
  "review",
  "payment",
  "confirmation",
  "myBookingCard",
  "chunkedDetail",
  "viewDetailResolver",
  "manageResolver",
];

function statusClass(value: boolean) {
  return value
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";
}

function comparisonClass(status: PlannerFieldComparison["status"]) {
  if (status === "present") return "bg-emerald-50 text-emerald-800";
  if (status === "mismatched") return "bg-amber-50 text-amber-800";
  if (status === "empty") return "bg-orange-50 text-orange-800";
  return "bg-rose-50 text-rose-800";
}

function priorityClass(priority: PlannerFlowIssue["priority"]) {
  if (priority === "high") return "bg-rose-50 text-rose-800";
  if (priority === "medium") return "bg-amber-50 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function formatSize(size: number) {
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function Cell({ value }: { value: string }) {
  return (
    <td className="max-w-[220px] truncate border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
      {value || "—"}
    </td>
  );
}

function SummaryCard({
  label,
  value,
  ok,
}: {
  label: string;
  ok?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <div
        className={`mt-3 inline-flex max-w-full rounded-full border px-3 py-1 text-sm font-black ${
          typeof ok === "boolean" ? statusClass(ok) : "border-slate-200 bg-slate-50 text-slate-800"
        }`}
      >
        <span className="truncate">{value || "Not found"}</span>
      </div>
    </div>
  );
}

function FieldComparisonTable({
  rows,
}: {
  rows: PlannerFieldComparison[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Stage Comparison</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[1500px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">Field</th>
              {stageOrder.map((stage) => (
                <th key={stage} className="border-b border-slate-200 px-3 py-2">
                  {stageLabels[stage]}
                </th>
              ))}
              <th className="border-b border-slate-200 px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.field}>
                <td className="border-b border-slate-100 px-3 py-2 text-xs font-black text-slate-950">
                  {row.field}
                </td>
                {stageOrder.map((stage) => (
                  <Cell key={stage} value={row.stageValues[stage]} />
                ))}
                <td className="border-b border-slate-100 px-3 py-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${comparisonClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function IssuesTable({ rows }: { rows: PlannerFlowIssue[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Issues Found</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[980px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">Priority</th>
              <th className="border-b border-slate-200 px-3 py-2">Field</th>
              <th className="border-b border-slate-200 px-3 py-2">Lost Between</th>
              <th className="border-b border-slate-200 px-3 py-2">Reason</th>
              <th className="border-b border-slate-200 px-3 py-2">Suggested Fix File</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={`${row.field}-${row.reason}`}>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${priorityClass(row.priority)}`}
                    >
                      {row.priority}
                    </span>
                  </td>
                  <Cell value={row.field} />
                  <Cell value={row.lostBetween} />
                  <Cell value={row.reason} />
                  <Cell value={row.suggestedFixFile} />
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-4 text-sm font-semibold text-emerald-700" colSpan={5}>
                  No mismatches detected in the current diagnostic snapshot.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StorageTable({ rows }: { rows: PlannerStorageSnapshot[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Storage Keys</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[1100px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <th className="border-b border-slate-200 px-3 py-2">Key</th>
              <th className="border-b border-slate-200 px-3 py-2">Storage</th>
              <th className="border-b border-slate-200 px-3 py-2">Exists</th>
              <th className="border-b border-slate-200 px-3 py-2">Size</th>
              <th className="border-b border-slate-200 px-3 py-2">Important Fields Found</th>
              <th className="border-b border-slate-200 px-3 py-2">Problem</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.storage}-${row.key}`}>
                <Cell value={row.key} />
                <Cell value={row.storage} />
                <td className="border-b border-slate-100 px-3 py-2">
                  <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${statusClass(row.exists)}`}>
                    {row.exists ? "Yes" : "No"}
                  </span>
                </td>
                <Cell value={formatSize(row.size)} />
                <Cell value={row.importantFieldsFound.slice(0, 8).join(", ")} />
                <Cell value={row.problem} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BookingIdComparison({
  diagnostic,
}: {
  diagnostic: SmartPlannerFlowDiagnostic;
}) {
  const rows = Object.entries(diagnostic.bookingIdComparison);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">BookingId Comparison</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([key, value]) => (
          <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              {key}
            </p>
            <p className="mt-1 truncate text-sm font-black text-slate-900">
              {value || "Not found"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SmartPlannerDebugFlowPage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const diagnostic = useMemo(() => diagnoseSmartPlannerBookingFlow(), [refreshTick]);

  async function copyDiagnostic() {
    const serialized = JSON.stringify(diagnostic, null, 2);
    try {
      await navigator.clipboard.writeText(serialized);
      setCopyStatus("Diagnostic JSON copied.");
    } catch {
      setCopyStatus("Clipboard blocked. Use browser devtools to inspect the page state.");
    }
  }

  function clearTempStorage() {
    const confirmed = window.confirm(
      "Clear only Smart Planner temporary working storage? Confirmed bookings, booking details, auth, and wallet data will not be deleted."
    );
    if (!confirmed) return;
    clearSmartPlannerDiagnosticTempStorage();
    setRefreshTick((value) => value + 1);
  }

  if (process.env.NODE_ENV === "production") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-8 text-slate-950">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold shadow-sm">
          Smart Planner flow diagnostics are disabled in production builds.
        </div>
      </main>
    );
  }

  const summary = diagnostic.snapshotSummary;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 p-4 text-slate-950 lg:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700">
            Development Diagnostic
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-normal text-slate-950">
                Tiya Smart Planner Flow Diagnostic
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                Read-only comparison across Workspace, Review, Payment,
                Confirmation, My Bookings, chunked detail, and resolver output.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRefreshTick((value) => value + 1)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 shadow-sm"
              >
                Refresh Snapshot
              </button>
              <button
                type="button"
                onClick={copyDiagnostic}
                className="rounded-full border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-black text-white shadow-sm"
              >
                Copy Diagnostic JSON
              </button>
              <button
                type="button"
                onClick={clearTempStorage}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 shadow-sm"
              >
                Clear Smart Planner Temp Storage
              </button>
            </div>
          </div>
          {copyStatus ? (
            <p className="mt-3 text-sm font-bold text-slate-600">{copyStatus}</p>
          ) : null}
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Latest Smart Planner BookingId"
            value={summary.latestSmartPlannerBookingId}
          />
          <SummaryCard
            label="Confirmation Payload Available"
            ok={summary.confirmationPayloadAvailable}
            value={summary.confirmationPayloadAvailable ? "Yes" : "No"}
          />
          <SummaryCard
            label="My Booking Card Available"
            ok={summary.myBookingCardAvailable}
            value={summary.myBookingCardAvailable ? "Yes" : "No"}
          />
          <SummaryCard
            label="Chunked Detail Available"
            ok={summary.chunkedDetailAvailable}
            value={summary.chunkedDetailAvailable ? "Yes" : "No"}
          />
          <SummaryCard
            label="View Detail Resolver Full Payload"
            ok={summary.viewDetailResolverHasFullPayload}
            value={summary.viewDetailResolverHasFullPayload ? "Yes" : "No"}
          />
          <SummaryCard
            label="Manage Resolver Full Payload"
            ok={summary.manageResolverHasFullPayload}
            value={summary.manageResolverHasFullPayload ? "Yes" : "No"}
          />
        </section>

        <BookingIdComparison diagnostic={diagnostic} />
        <FieldComparisonTable rows={diagnostic.fieldComparisons} />
        <IssuesTable rows={diagnostic.issues} />
        <StorageTable rows={diagnostic.storageSnapshots} />
      </div>
    </main>
  );
}
