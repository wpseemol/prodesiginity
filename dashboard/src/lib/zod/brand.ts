import { z } from "zod";

/** Brand marquee logos — keep light for fast carousel load. */
export const LOGO_MAX_BYTES = 1 * 1024 * 1024;
export const LOGO_MAX_MB = 1;
export const LOGO_REC_WIDTH = 240;
export const LOGO_REC_HEIGHT = 80;
export const LOGO_MIN_WIDTH = 80;
export const LOGO_MIN_HEIGHT = 32;
export const LOGO_MAX_WIDTH = 800;
export const LOGO_MAX_HEIGHT = 320;

export const LOGO_HINT = `PNG / WebP · max ${LOGO_MAX_MB} MB · ${LOGO_REC_WIDTH}×${LOGO_REC_HEIGHT}px`;

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Use #RGB or #RRGGBB");

export const brandFormSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(120),
  logo: z.string().trim().min(1, "Upload a logo image").max(512),
  color: hexColorSchema,
});

export type BrandFormValues = z.infer<typeof brandFormSchema>;

export const brandLogoFileSchema = z
  .custom<File>((v) => typeof File !== "undefined" && v instanceof File, {
    message: "Choose a logo image",
  })
  .refine((f) => f.size > 0, { message: "File is empty" })
  .refine((f) => f.size <= LOGO_MAX_BYTES, {
    message: `Logo must be ${LOGO_MAX_MB} MB or smaller`,
  })
  .refine(
    (f) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type),
    { message: "Use PNG, WebP, JPEG, or GIF" },
  );

export const brandsContentSchema = z.object({
  brands: z.array(brandFormSchema).max(60),
});
