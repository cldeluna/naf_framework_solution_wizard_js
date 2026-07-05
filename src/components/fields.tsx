/**
 * Shared form field components. All fields are CONTROLLED and write to the
 * store on every change — no submit step, no data loss on close/navigation.
 */
import type { ReactNode } from "react";
import { useWizard } from "../state/store";

/** True when the global field view is Compact ("Required only"). */
export function useCompact(): boolean {
  return useWizard((s) => s.fieldView) === "required";
}

/**
 * Renders children only in the Detailed view — for headings/blocks whose
 * fields are all optional (they'd hide themselves, leaving an orphan heading).
 */
export function DetailOnly({ children }: { children: ReactNode }) {
  return useCompact() ? null : <>{children}</>;
}

/**
 * Field wrapper. In the global Compact ("Required only") view (SPEC §2.4),
 * optional fields are hidden — only required/recommended fields render.
 */
export function Field({ label, required, recommended, children, hint }: {
  label: string; required?: boolean; recommended?: boolean; hint?: string; children: ReactNode;
}) {
  const compact = useCompact();
  if (compact && !required && !recommended) return null;
  return (
    <label className="field">
      <span className="field-label">
        {label} {required && <span className="req">*</span>}
      </span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
}) {
  return (
    <input type="text" value={value} placeholder={placeholder} maxLength={maxLength}
           onChange={(e) => onChange(e.target.value)} />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3, maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLength?: number;
}) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows} maxLength={maxLength}
              onChange={(e) => onChange(e.target.value)} />
  );
}

/**
 * Checkbox grid over a string[] selection (curated options + optional custom
 * free-text entry). Mirrors the Streamlit "checkboxes + Custom (fill in)"
 * pattern: any selected value not in `options` is the custom entry.
 */
export function CheckboxGrid({ options, value, onChange, customLabel }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void; customLabel?: string;
}) {
  const custom = value.find((v) => !options.includes(v)) ?? "";
  const toggle = (opt: string, on: boolean) => {
    const rest = value.filter((v) => v !== opt);
    onChange(on ? [...rest, opt] : rest);
  };
  const setCustom = (text: string) => {
    const std = value.filter((v) => options.includes(v));
    onChange(text.trim() ? [...std, text] : std);
  };
  return (
    <div>
      <div className="check-grid">
        {options.map((opt) => (
          <label key={opt} className="check">
            <input type="checkbox" checked={value.includes(opt)}
                   onChange={(e) => toggle(opt, e.target.checked)} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {customLabel && (
        <div className="custom-row">
          <span className="field-hint">{customLabel}:</span>
          <input type="text" value={custom} placeholder="(optional custom entry)"
                 onChange={(e) => setCustom(e.target.value)} />
        </div>
      )}
    </div>
  );
}

/**
 * Radio over curated options with an "Other (fill in)" escape hatch, storing
 * a single resolved string (empty = unanswered). Mirrors the Streamlit
 * sentinel/Other radio pattern without storing sentinels.
 */
export function RadioWithOther({ options, value, onChange, name }: {
  options: string[]; value: string; onChange: (v: string) => void; name: string;
}) {
  const isOther = value !== "" && !options.includes(value);
  return (
    <div className="radio-group">
      {options.map((opt) => (
        <label key={opt} className="check">
          <input type="radio" name={name} checked={value === opt}
                 onChange={() => onChange(opt)} />
          <span>{opt}</span>
        </label>
      ))}
      <label className="check">
        <input type="radio" name={name} checked={isOther}
               onChange={() => onChange(" ")} />
        <span>Other (fill in)</span>
      </label>
      {isOther && (
        <input type="text" value={value === " " ? "" : value} placeholder="Please describe"
               onChange={(e) => onChange(e.target.value || " ")} />
      )}
    </div>
  );
}

export function Select({ options, value, onChange, allowOther, placeholder = "— Select one —" }: {
  options: string[]; value: string; onChange: (v: string) => void; allowOther?: boolean; placeholder?: string;
}) {
  const isOther = allowOther && value !== "" && !options.includes(value);
  return (
    <div>
      <select
        value={isOther ? "__other__" : value}
        onChange={(e) => onChange(e.target.value === "__other__" ? " " : e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        {allowOther && <option value="__other__">Other</option>}
      </select>
      {isOther && (
        <input type="text" value={value === " " ? "" : value} placeholder="Custom value"
               onChange={(e) => onChange(e.target.value || " ")} style={{ marginTop: 6 }} />
      )}
    </div>
  );
}
