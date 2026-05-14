"use client";

import { useState } from "react";
import { getPartyColour } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Party } from "@/lib/store/types";

// ─── Region Definitions (viewBox 0 0 280 500) ────────────────────────────────
// Simplified but geographically recognisable UK regions as SVG polygons.

export interface UKRegion {
  id: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

export const UK_REGIONS: UKRegion[] = [
  {
    id: "scotland",
    name: "Scotland",
    path: "M68,0 L195,0 L228,42 L225,85 L238,105 L215,138 L188,165 L162,170 L135,170 L112,160 L85,128 L65,88 L68,45 Z",
    labelX: 148,
    labelY: 92,
  },
  {
    id: "northern-ireland",
    name: "Northern Ireland",
    path: "M12,175 L55,170 L68,188 L62,215 L32,220 L12,200 Z",
    labelX: 38,
    labelY: 196,
  },
  {
    id: "north-east",
    name: "North East England",
    path: "M172,170 L218,160 L235,188 L232,218 L200,228 L182,212 L175,190 Z",
    labelX: 203,
    labelY: 196,
  },
  {
    id: "north-west",
    name: "North West England",
    path: "M112,160 L135,170 L162,170 L172,170 L175,190 L168,228 L148,245 L125,240 L102,218 L98,192 L110,170 Z",
    labelX: 133,
    labelY: 203,
  },
  {
    id: "yorkshire",
    name: "Yorkshire & the Humber",
    path: "M175,190 L200,228 L222,235 L228,258 L210,272 L185,272 L162,255 L158,232 L168,228 Z",
    labelX: 196,
    labelY: 238,
  },
  {
    id: "east-midlands",
    name: "East Midlands",
    path: "M185,272 L228,258 L242,285 L238,318 L215,328 L192,318 L180,298 Z",
    labelX: 213,
    labelY: 295,
  },
  {
    id: "west-midlands",
    name: "West Midlands",
    path: "M148,245 L162,255 L185,272 L180,298 L158,312 L135,308 L120,280 L125,258 Z",
    labelX: 153,
    labelY: 280,
  },
  {
    id: "wales",
    name: "Wales",
    path: "M82,240 L102,218 L125,240 L125,258 L120,280 L108,302 L90,325 L72,328 L58,312 L60,285 L68,262 Z",
    labelX: 90,
    labelY: 278,
  },
  {
    id: "east-of-england",
    name: "East of England",
    path: "M228,258 L262,252 L278,282 L272,315 L255,338 L235,348 L215,338 L215,328 L238,318 Z",
    labelX: 250,
    labelY: 298,
  },
  {
    id: "london",
    name: "London",
    path: "M215,328 L238,318 L242,348 L228,362 L210,365 L205,350 L208,335 Z",
    labelX: 224,
    labelY: 348,
  },
  {
    id: "south-east",
    name: "South East England",
    path: "M242,348 L265,342 L280,362 L275,388 L258,408 L232,415 L210,408 L205,380 L212,365 L228,362 Z",
    labelX: 246,
    labelY: 382,
  },
  {
    id: "south-west",
    name: "South West England",
    path: "M108,302 L135,308 L158,312 L180,298 L192,318 L205,350 L205,408 L182,422 L152,432 L120,428 L90,412 L68,395 L58,375 L62,348 L72,328 L90,325 L108,302 Z",
    labelX: 128,
    labelY: 375,
  },
];

// Map region id → the string key used in scenario.regionalResults
export const REGION_ID_TO_NAME: Record<string, string> = {
  "scotland": "Scotland",
  "northern-ireland": "Northern Ireland",
  "north-east": "North East England",
  "north-west": "North West England",
  "yorkshire": "Yorkshire & the Humber",
  "east-midlands": "East Midlands",
  "west-midlands": "West Midlands",
  "wales": "Wales",
  "east-of-england": "East of England",
  "london": "London",
  "south-east": "South East England",
  "south-west": "South West England",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface UKMapProps {
  /** Party that won each region (by scenario name key) */
  regionalResults?: Record<string, Party>;
  /** Highlighted region id */
  highlighted?: string | null;
  /** Selected region id */
  selected?: string | null;
  /** Called when a region is clicked */
  onRegionClick?: (regionId: string, regionName: string) => void;
  /** Show region name labels */
  showLabels?: boolean;
  /** Overall opacity for uncoloured regions */
  baseOpacity?: number;
  className?: string;
  width?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UKMap({
  regionalResults,
  highlighted,
  selected,
  onRegionClick,
  showLabels = false,
  baseOpacity = 0.15,
  className,
  width = 280,
}: UKMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const active = highlighted ?? hovered;

  return (
    <svg
      viewBox="0 0 280 500"
      width={width}
      height={(width / 280) * 500}
      className={cn("select-none", className)}
      style={{ overflow: "visible" }}
    >
      {/* Drop shadow / glow filter */}
      <defs>
        <filter id="map-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="region-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Regions */}
      {UK_REGIONS.map((region) => {
        const regionName = REGION_ID_TO_NAME[region.id];
        const winnerParty = regionalResults?.[regionName];
        const partyColour = winnerParty ? getPartyColour(winnerParty) : "#334155";

        const isActive = active === region.id;
        const isSelected = selected === region.id;
        const isInteractive = !!onRegionClick;

        const fillOpacity = winnerParty
          ? isActive ? 0.9 : isSelected ? 0.85 : 0.65
          : isActive ? 0.35 : baseOpacity;

        const strokeColour = isSelected
          ? "#ffffff"
          : isActive
          ? "#94a3b8"
          : "rgba(255,255,255,0.15)";

        const strokeWidth = isSelected ? 2 : isActive ? 1.5 : 0.8;

        return (
          <g key={region.id}>
            <path
              d={region.path}
              fill={partyColour}
              fillOpacity={fillOpacity}
              stroke={strokeColour}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              style={{
                cursor: isInteractive ? "pointer" : "default",
                transition: "fill-opacity 0.25s ease, stroke 0.2s ease",
                filter: isSelected ? "url(#region-glow)" : "none",
              }}
              onMouseEnter={() => isInteractive && setHovered(region.id)}
              onMouseLeave={() => isInteractive && setHovered(null)}
              onClick={() => onRegionClick?.(region.id, regionName)}
            />

            {/* Region label */}
            {showLabels && (isActive || isSelected || !regionalResults) && (
              <text
                x={region.labelX}
                y={region.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={region.id === "london" || region.id === "northern-ireland" ? 5 : 6.5}
                fontWeight="600"
                fill="white"
                fillOpacity={0.95}
                style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
              >
                {region.id === "yorkshire" ? "Yorks" : region.id === "northern-ireland" ? "N.I." : region.id === "east-of-england" ? "East" : region.id === "north-east" ? "NE" : region.id === "north-west" ? "NW" : region.id === "east-midlands" ? "E.Mid" : region.id === "west-midlands" ? "W.Mid" : region.id === "south-east" ? "SE" : region.id === "south-west" ? "SW" : regionName}
              </text>
            )}

            {/* Selected ring */}
            {isSelected && (
              <path
                d={region.path}
                fill="none"
                stroke="white"
                strokeWidth={2.5}
                strokeLinejoin="round"
                opacity={0.8}
                style={{ pointerEvents: "none" }}
              />
            )}
          </g>
        );
      })}

      {/* Always-on labels (static mode) */}
      {showLabels && regionalResults && UK_REGIONS.map((region) => {
        const isActive = active === region.id;
        const isSelected = selected === region.id;
        if (isActive || isSelected) return null;
        return (
          <text
            key={`label-${region.id}`}
            x={region.labelX}
            y={region.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={region.id === "london" || region.id === "northern-ireland" ? 5 : 6}
            fontWeight="500"
            fill="rgba(255,255,255,0.7)"
            style={{ pointerEvents: "none" }}
          >
            {region.id === "yorkshire" ? "Yorks" : region.id === "northern-ireland" ? "N.I." : region.id === "east-of-england" ? "East Eng" : region.id === "north-east" ? "NE" : region.id === "north-west" ? "NW" : region.id === "east-midlands" ? "E.Mid" : region.id === "west-midlands" ? "W.Mid" : region.id === "south-east" ? "SE Eng" : region.id === "south-west" ? "SW Eng" : REGION_ID_TO_NAME[region.id]}
          </text>
        );
      })}
    </svg>
  );
}
