import { Camera, Sparkles, TreePine, Video, Waves, Ship } from "lucide-react";

/** Premium trending wedding categories for desktop home feature grid. */
export const HOME_DESKTOP_FEATURE_CARDS = [
  {
    key: "beach-cliffside",
    title: "Destination Beach & Cliffside",
    subtext: "Curated venues",
    href: "/venues",
    Icon: Waves,
  },
  {
    key: "backwater-heritage",
    title: "Backwater Heritage Luxury",
    subtext: "Premium resorts",
    href: "/venues",
    Icon: Ship,
  },
  {
    key: "garden-estate",
    title: "Intimate Garden & Estate",
    subtext: "Boutique lawns",
    href: "/venues",
    Icon: TreePine,
  },
  {
    key: "cinematic-visuals",
    title: "Cinematic & Documentary Visuals",
    subtext: "Top storytellers",
    href: "/photography",
    Icon: Video,
  },
  {
    key: "bridal-glow",
    title: "The Minimalist Bridal Glow",
    subtext: "Elite makeup artists",
    href: "/makeup",
    Icon: Sparkles,
  },
  {
    key: "pre-wedding",
    title: "Pre-Wedding Editorial Shoots",
    subtext: "All-inclusive visual sets",
    href: "/photography",
    Icon: Camera,
  },
];
