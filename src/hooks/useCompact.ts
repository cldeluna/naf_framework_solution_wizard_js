import { useContext } from "react";
import { useWizard } from "../state/store";
import { ViewContext } from "./ViewContext";

/** True when compact/required-only mode is active.
 *  Per-panel ViewContext takes precedence over the global store value. */
export function useCompact(): boolean {
  const ctx = useContext(ViewContext);
  const global = useWizard((s) => s.fieldView) === "required";
  return ctx !== null ? ctx.compact : global;
}
