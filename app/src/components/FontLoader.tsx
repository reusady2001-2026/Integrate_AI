"use client";

import { useEffect } from "react";

// The 50-font deck library. Loaded client-side as stylesheet links so the
// font picker's options each render a genuinely distinct, downloaded face.
// (Rendering these <link>s in the server tree gets stripped by React/Next's
// resource handling under static export, so we inject them on mount.)
const FONT_HREFS = [
  "https://fonts.googleapis.com/css2?family=Alef&family=Arimo:wght@400;700&family=Assistant:wght@400;700&family=Bellefair&family=Bona+Nova+SC:wght@400;700&family=Cousine:wght@400;700&family=David+Libre:wght@400;500;700&family=Frank+Ruhl+Libre:wght@400;500;700;900&family=IBM+Plex+Sans+Hebrew:wght@400;600;700&family=Miriam+Libre:wght@400;700&family=Noto+Rashi+Hebrew:wght@400;700;900&family=Noto+Sans+Hebrew:wght@400;700;900&family=Noto+Serif+Hebrew:wght@400;700;900&family=Open+Sans:wght@400;700&family=Rubik:wght@400;500;700;900&family=Secular+One&family=Tinos:wght@400;700&family=Varela+Round&display=swap",
  "https://fonts.googleapis.com/css2?family=Rubik+80s+Fade&family=Rubik+Beastly&family=Rubik+Broken+Fax&family=Rubik+Bubbles&family=Rubik+Burned&family=Rubik+Dirt&family=Rubik+Distressed&family=Rubik+Doodle+Shadow&family=Rubik+Doodle+Triangles&family=Rubik+Gemstones&family=Rubik+Glitch+Pop&family=Rubik+Iso&family=Rubik+Lines&family=Rubik+Maps&family=Rubik+Marker+Hatch&family=Rubik+Maze&family=Rubik+Microbe&family=Rubik+Mono+One&family=Rubik+Pixels&family=Rubik+Puddles&family=Rubik+Scribble&family=Rubik+Spray+Paint&family=Rubik+Storm&family=Rubik+Vinyl&family=Rubik+Wet+Paint&display=swap",
  "https://fonts.googleapis.com/css2?family=Gveret+Levin&family=Karantina:wght@300;400;700&family=Rubik+Glitch&family=Suez+One&display=swap",
  "https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&display=swap",
];

export function FontLoader() {
  useEffect(() => {
    const head = document.head;
    const ensurePreconnect = (href: string, cors?: boolean) => {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = "preconnect";
      l.href = href;
      if (cors) l.crossOrigin = "anonymous";
      head.appendChild(l);
    };
    ensurePreconnect("https://fonts.googleapis.com");
    ensurePreconnect("https://fonts.gstatic.com", true);
    for (const href of FONT_HREFS) {
      if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) continue;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      head.appendChild(l);
    }
  }, []);
  return null;
}
