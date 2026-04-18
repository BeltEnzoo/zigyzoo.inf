"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = {
  text: string;
};

export function ProductCardDescription({ text }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const pRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = pRef.current;
    if (!el || expanded) return;

    function measure() {
      if (!pRef.current) return;
      const node = pRef.current;
      setShowToggle(node.scrollHeight > node.clientHeight + 1);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, expanded]);

  return (
    <div className="border-b border-black/[0.06] bg-surface-ice/30 px-4 py-2.5">
      <p
        ref={pRef}
        className={`text-sm leading-snug text-foreground/75 ${expanded ? "" : "line-clamp-3"}`}
      >
        {text}
      </p>
      {showToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="mt-1 text-xs font-semibold text-brand hover:underline"
        >
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}
