/** Team avatar edit: keep the saved one, clear it, or use a preset (by id). */
export type AvatarChoice = "keep" | "none" | number;

export function appendAvatarChoice(body: FormData, choice: AvatarChoice) {
  if (typeof choice === "number") body.append("avatarPresetId", String(choice));
  else if (choice === "none") body.append("removeAvatar", "true");
}
