import MissionEnvironment from "../../mission-environment/src/pages/MissionEnvironment.jsx";
import missionEnvironmentStyles from "../../mission-environment/src/index.css?inline";
import embeddedModuleStyles from "./embeddedModules.css?inline";
import ShadowRootPortal from "./ShadowRootPortal.jsx";

export default function MissionEnvironmentEmbedded({ hidden }) {
  return (
    <ShadowRootPortal
      ariaLabel="Mission Environment"
      hidden={hidden}
      styles={`${missionEnvironmentStyles}\n${embeddedModuleStyles}`}
    >
      <MissionEnvironment />
    </ShadowRootPortal>
  );
}
