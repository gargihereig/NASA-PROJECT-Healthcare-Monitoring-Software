import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import RiskAlertsApp from "../../astronaut-risk-alerts/src/App.jsx";
import riskAlertsStyles from "../../astronaut-risk-alerts/src/App.css?inline";
import embeddedModuleStyles from "./embeddedModules.css?inline";

const scopedRiskAlertsStyles = riskAlertsStyles.replace(/:root/g, ":host");

export default function RiskAlertsEmbedded({ hidden }) {
  const hostRef = useRef(null);
  const [shadowRoot, setShadowRoot] = useState(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    setShadowRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
  }, []);

  return (
    <div
      aria-label="Astronaut Risk Alerts"
      aria-hidden={hidden}
      data-hidden={hidden ? "true" : undefined}
      ref={hostRef}
    >
      {shadowRoot && createPortal(
        <>
          <style>{scopedRiskAlertsStyles}</style>
          <style>{embeddedModuleStyles}</style>
          <RiskAlertsApp />
        </>,
        shadowRoot,
      )}
    </div>
  );
}
