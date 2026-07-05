import { useWizard } from "../state/store";

/** True when the global field view is Compact ("Required only"). */
export function useCompact(): boolean {
  return useWizard((s) => s.fieldView) === "required";
}
