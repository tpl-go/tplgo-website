import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClass = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export function Field({ label, help, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; help?: string; error?: string }) {
  return <label className="block text-sm font-semibold text-slate-800"><span>{label}</span><input {...props} className={`${inputClass} ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" : ""}`} />{error ? <span className="mt-1 block text-xs font-semibold text-rose-700">{error}</span> : help ? <span className="mt-1 block text-xs font-medium text-slate-600">{help}</span> : null}</label>;
}

export function TextareaField({ label, help, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; help?: string; error?: string }) {
  return <label className="block text-sm font-semibold text-slate-800"><span>{label}</span><textarea {...props} className={`${inputClass} min-h-28 resize-y ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" : ""}`} />{error ? <span className="mt-1 block text-xs font-semibold text-rose-700">{error}</span> : help ? <span className="mt-1 block text-xs font-medium text-slate-600">{help}</span> : null}</label>;
}

export function SelectField({ label, children, error, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  return <label className="block text-sm font-semibold text-slate-800"><span>{label}</span><select {...props} className={`${inputClass} ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" : ""}`}>{children}</select>{error && <span className="mt-1 block text-xs font-semibold text-rose-700">{error}</span>}</label>;
}

export function StepIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">{eyebrow}</p><h1 className="mt-2">{title}</h1><p className="mt-3 font-medium text-slate-600">{copy}</p></div>;
}
