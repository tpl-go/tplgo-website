export const MAX_PARTNER_CAPACITY = 1_000_000;

export type PartnerInventoryDraft = {
  id?: string;
  version?: number;
  serviceScopeId: string;
  stableKey: string;
  label: string;
  inventoryType: string;
  capacityUnit: string;
  capacityTotal: string;
  status: 'draft' | 'active' | 'inactive';
};

export const emptyPartnerInventoryDraft = (): PartnerInventoryDraft => ({
  serviceScopeId: '',
  stableKey: '',
  label: '',
  inventoryType: 'unit',
  capacityUnit: 'room',
  capacityTotal: '',
  status: 'draft',
});

export function inventoryStableKey(label: string): string {
  return label.trim().toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export function validatePartnerInventoryDraft(draft: PartnerInventoryDraft): {ok: true; body: Record<string, unknown>} | {ok: false; message: string} {
  const label = draft.label.trim();
  if (!draft.serviceScopeId) return {ok: false, message: 'Choose the service for this inventory item.'};
  if (!label) return {ok: false, message: 'Enter an inventory item name.'};
  if (label.length > 120) return {ok: false, message: 'Inventory item name must be 120 characters or fewer.'};
  if (!/^\d+$/.test(draft.capacityTotal)) return {ok: false, message: 'Enter capacity as a whole number.'};
  const capacityTotal = Number(draft.capacityTotal);
  if (!Number.isSafeInteger(capacityTotal) || capacityTotal < 0 || capacityTotal > MAX_PARTNER_CAPACITY) return {ok: false, message: `Capacity must be between 0 and ${MAX_PARTNER_CAPACITY.toLocaleString('en-IN')}.`};
  const stableKey = draft.stableKey || inventoryStableKey(label);
  if (!stableKey) return {ok: false, message: 'Enter a name containing letters or numbers.'};
  return {ok: true, body: {...draft, label, stableKey, capacityTotal}};
}
