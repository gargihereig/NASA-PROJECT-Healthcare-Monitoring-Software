import { lazy, Suspense } from "react";
import overviewStyles from "../../Overview/src/styles.css?inline";
import embeddedModuleStyles from "./embeddedModules.css?inline";
import ShadowRootPortal from "./ShadowRootPortal.jsx";

const Overview = lazy(() => import("../../Overview/src/App.jsx"));

export default function OverviewEmbedded({ hidden }) {
  return (
    <ShadowRootPortal
      ariaLabel="Overview"
      hidden={hidden}
      styles={`${overviewStyles}\n${embeddedModuleStyles}`}
    >
      <Suspense fallback={<div role="status">Loading Overview...</div>}>
        <Overview />
      </Suspense>
    </ShadowRootPortal>
  );
}
