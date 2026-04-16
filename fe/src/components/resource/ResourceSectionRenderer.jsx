import React from "react";
import { ResourceTableSection } from "./ResourceTableSection";
import { ResourceInfoSection, ResourceListSection, ResourceConstellationSection } from "./ResourceInfoSections";

const ResourceSectionRenderer = ({ section, language }) => {
  const isEn = language === 'en';

  switch (section.type) {
    case "text":
      return <ResourceInfoSection section={section} isEn={isEn} />;
      
    case "list":
      return <ResourceListSection section={section} isEn={isEn} />;

    case "fragment_star_upgrade":
    case "fragment_au_upgrade":
    case "nova_crystal_usage":
    case "stardust_acquisition":
    case "stardust_usage":
    case "fragment_sources":
    case "glory_road":
    case "star_crystal_usage":
    case "gemstone_usage":
    case "reliquary_tiers":
    case "vault_tiers":
    case "vessel_tiers":
    case "gemstone_vessel_tiers":
    case "runic_vessel_tiers":
    case "spirit_blossom_tiers":
      return <ResourceTableSection section={section} isEn={isEn} />;

    case "fragment_constellation":
    case "fragment_au_constellation":
      return <ResourceConstellationSection section={section} isEn={isEn} />;

    default:
      return null;
  }
};

export default ResourceSectionRenderer;
