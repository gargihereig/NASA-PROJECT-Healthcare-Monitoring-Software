import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ShadowRootPortal({ ariaLabel, hidden, styles, children }) {
  const hostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    setShadowRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);

  useEffect(() => {
    if (hidden) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [hidden]);

  return (
    <div
      aria-label={ariaLabel}
      aria-hidden={hidden}
      data-hidden={hidden ? "true" : undefined}
      ref={hostRef}
    >
      {shadowRoot && createPortal(
        <>
          <style>{styles}</style>
          {children}
        </>,
        shadowRoot,
      )}
    </div>
  );
}
