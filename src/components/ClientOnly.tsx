import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders children only after the component has mounted on the client.
 * Use to avoid SSR/CSR hydration mismatches for time-dependent UI.
 */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
