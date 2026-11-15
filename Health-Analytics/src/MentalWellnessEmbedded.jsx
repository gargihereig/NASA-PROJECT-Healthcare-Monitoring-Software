import MentalWellness from "../../Mental wellness/src/MentalWellness.jsx";
import mentalWellnessStyles from "../../Mental wellness/src/MentalWellness.css?inline";
import embeddedModuleStyles from "./embeddedModules.css?inline";
import ShadowRootPortal from "./ShadowRootPortal.jsx";

const sectionLinks = [
  ["overview", "Overview"],
  ["sleep", "Sleep monitoring"],
  ["mood", "Mood check-in"],
  ["stress", "Stress monitor"],
  ["recommendations", "Wellness toolkit"],
];

export default function MentalWellnessEmbedded({ hidden }) {
  return (
    <ShadowRootPortal
      ariaLabel="Mental Wellness"
      hidden={hidden}
      styles={`${mentalWellnessStyles}\n${embeddedModuleStyles}`}
    >
      <nav className="mw-section-nav" aria-label="Mental Wellness sections">
        {sectionLinks.map(([id, label]) => (
          <a
            href={`#${id}`}
            key={id}
            onClick={event => {
              event.preventDefault();
              event.currentTarget
                .getRootNode()
                .getElementById(id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <MentalWellness />
    </ShadowRootPortal>
  );
}
