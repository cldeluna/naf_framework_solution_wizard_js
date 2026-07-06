import { createContext } from "react";

export interface ViewContextValue {
  compact: boolean;
  toggle: () => void;
}

export const ViewContext = createContext<ViewContextValue | null>(null);
