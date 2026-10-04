import { z } from "zod";

const CLIENT_ID_PATTERN = /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/i;

export const updateGoogleSettingsSchema = z.object({
  /** Empty string removes the saved client ID (the env value is used again). */
  clientId: z
    .string()
    .trim()
    .max(255)
    .refine((v) => v === "" || CLIENT_ID_PATTERN.test(v), {
      message: "Client ID should look like 1234567890-abc123.apps.googleusercontent.com",
    })
    .optional(),
  /** Empty string keeps the saved secret; send clearClientSecret to wipe it. */
  clientSecret: z.string().trim().max(255).optional(),
  clearClientSecret: z.boolean().optional(),
});
