import { z } from "zod";

export const MAX_AVATAR_PRESETS = 5;

export const avatarPresetLabelSchema = z.object({
  label: z.string().trim().max(80).nullable().optional(),
});

export const reorderAvatarPresetsSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(MAX_AVATAR_PRESETS),
});

/** `presetId: null` goes back to the uploaded photo or Google picture. */
export const chooseAvatarSchema = z.object({
  presetId: z.number().int().positive().nullable(),
});
