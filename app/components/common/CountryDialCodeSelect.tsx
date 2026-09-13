import type { CSSProperties } from "react";
import { COUNTRY_OPTIONS } from "@/app/lib/auth/mobileCountries";

export default function CountryDialCodeSelect({ label, value, onChange, style, className, disabled }: {
  label: string; value: string; onChange: (value: string) => void;
  style?: CSSProperties; className?: string; disabled?: boolean;
}) {
  return <select aria-label={`${label} country and dial code`} value={value} onChange={(event) => onChange(event.target.value)} style={style} className={className} disabled={disabled}>
    {COUNTRY_OPTIONS.map((item) => <option key={item.code} value={item.code}>{item.name} {item.dialCode ? `+${item.dialCode}` : ""}</option>)}
  </select>;
}
