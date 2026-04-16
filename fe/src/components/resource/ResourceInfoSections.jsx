import React from "react";
import MarkupRenderer from "../common/MarkupRenderer";
import SafeImage from "../common/SafeImage";
import { ICONS } from "../../assets/data/assets";
import { autoLinkResources, stripMarkup } from "../../utils/markupUtils";

/**
 * Text Section
 */
export const ResourceInfoSection = ({ section, isEn }) => (
  <div className="bg-surface-hover/30 border border-border rounded-lg p-5 text-text-secondary text-base leading-relaxed">
    <MarkupRenderer text={autoLinkResources(isEn ? section.data_en : section.data)} />
  </div>
);

/**
 * List Section
 */
export const ResourceListSection = ({ section, isEn }) => {
  const listData = isEn ? section.data_en : section.data;
  return (
    <ul className="space-y-2">
      {listData.map((item, idx) => (
        <li key={idx} className="flex items-start gap-3 p-3 bg-surface-hover/20 border border-border rounded-lg group hover:bg-surface-hover/50 transition-colors">
          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
          <span className="text-text-secondary text-base">
            <MarkupRenderer text={autoLinkResources(item)} />
          </span>
        </li>
      ))}
    </ul>
  );
};

/**
 * Constellation Upgrade Section
 */
export const ResourceConstellationSection = ({ section, isEn }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {section.data.map((item, idx) => (
      <div key={idx} className="bg-surface-bg border border-border p-4 rounded-xl hover:border-primary-500 transition-all group shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-text-primary text-lg font-bold group-hover:text-primary-500 transition-colors">
            <MarkupRenderer text={isEn ? (item.name_en || item.name) : (item.name_vi || item.name)} />
          </h4>
          <div className="flex items-center bg-primary-500/10 px-2 py-0.5 rounded text-sm text-primary-500 border border-primary-500/20 font-bold">
            {item.cost || 0}
            <SafeImage src={ICONS.item.fragment_small} className="w-3 h-3 ml-1" />
          </div>
        </div>
        {(item.effect || item.note) && (
          <p className="text-text-secondary text-sm leading-relaxed">
            <MarkupRenderer text={isEn ? (item.effect_en || item.effect || item.note) : (item.effect || item.note)} />
          </p>
        )}
      </div>
    ))}
  </div>
);
