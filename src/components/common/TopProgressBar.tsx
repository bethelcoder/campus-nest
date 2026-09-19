"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger loading progress on path or search param change
  useEffect(() => {
    // Complete progress when navigation finishes
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept click on any internal <a> link to start progress bar instantly
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (!anchor || !anchor.href) return;
      if (anchor.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey) return;

      const url = new URL(anchor.href, window.location.href);
      const isInternal = url.origin === window.location.origin;
      const isSamePageAnchor = url.pathname === window.location.pathname && url.search === window.location.search && url.hash;

      if (isInternal && !isSamePageAnchor && url.href !== window.location.href) {
        setLoading(true);
        setProgress(35);
        setTimeout(() => setProgress((p) => (p === 35 ? 75 : p)), 150);
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-[#005F56] via-emerald-400 to-[#005F56] transition-all duration-300 ease-out shadow-xs shadow-emerald-500/50"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
        }}
      />
    </div>
  );
}
