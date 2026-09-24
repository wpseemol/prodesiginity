/** Recommended pixel sizes for marketing-site / dashboard uploads. */

export type ImageSpec = {
  label: string;
  width: number;
  height: number;
  maxMb: number;
  formats: string;
  note?: string;
};

export function formatImageHint(spec: ImageSpec): string {
  const base = `${spec.formats} · max ${spec.maxMb} MB · ${spec.width}×${spec.height}px`;
  return spec.note ? `${base} · ${spec.note}` : base;
}

export const IMAGE_SPECS = {
  favicon: {
    label: "Favicon",
    width: 48,
    height: 48,
    maxMb: 2,
    formats: "ICO / PNG / SVG",
    note: "square works best",
  },
  loginLogo: {
    label: "Login logo",
    width: 240,
    height: 80,
    maxMb: 5,
    formats: "PNG / WebP / SVG",
    note: "shown ~36px tall on login",
  },
  brandLogo: {
    label: "Brand logo (SEO)",
    width: 512,
    height: 512,
    maxMb: 5,
    formats: "PNG / WebP",
    note: "square or horizontal OK",
  },
  ogImage: {
    label: "Open Graph",
    width: 1200,
    height: 630,
    maxMb: 5,
    formats: "JPEG / PNG / WebP",
    note: "social / Google share",
  },
  brandMarquee: {
    label: "Brand marquee logo",
    width: 240,
    height: 80,
    maxMb: 1,
    formats: "PNG / WebP",
  },
  teamPhoto: {
    label: "Team photo",
    width: 800,
    height: 1000,
    maxMb: 5,
    formats: "JPEG / PNG / WebP",
    note: "portrait 4:5",
  },
  projectThumb: {
    label: "Project thumbnail",
    width: 1280,
    height: 720,
    maxMb: 5,
    formats: "JPEG / PNG / WebP",
    note: "16:9",
  },
  projectVideo: {
    label: "Project video",
    width: 1920,
    height: 1080,
    maxMb: 120,
    formats: "MP4 / WebM",
    note: "16:9",
  },
  profilePhoto: {
    label: "Profile photo",
    width: 400,
    height: 400,
    maxMb: 5,
    formats: "JPEG / PNG / WebP",
    note: "square",
  },
  homepageImage: {
    label: "Homepage image",
    width: 1600,
    height: 900,
    maxMb: 5,
    formats: "JPEG / PNG / WebP",
    note: "16:9 preferred",
  },
} as const satisfies Record<string, ImageSpec>;
