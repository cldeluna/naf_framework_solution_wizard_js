/**
 * Minimal hash-based router — zero dependencies (react-router can replace
 * this later if routes grow). Routes: "/", "/wizard", "/solutions",
 * "/admin", "/terms".
 */
import { useEffect, useState } from "react";

export type Route = "/" | "/wizard" | "/solutions" | "/admin" | "/terms";

function current(): Route {
  const h = window.location.hash.replace(/^#/, "") || "/";
  return (["/", "/wizard", "/solutions", "/admin", "/terms"].includes(h) ? h : "/") as Route;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(current());
  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function navigate(to: Route) {
  window.location.hash = to;
}
