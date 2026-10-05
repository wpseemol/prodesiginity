/** Where in an editor to take the user: scroll to `target`, focus `focus`. */
export type EditTarget = { target: string; focus?: string };

const FLASH = ["ring-2", "ring-primary/60", "ring-offset-2", "ring-offset-background"];

/** Scroll the editor to a field, focus it and flash it so it's easy to spot. */
export function jumpToEdit({ target, focus }: EditTarget) {
  const section = document.getElementById(target);
  const field = focus ? document.getElementById(focus) : null;
  const el = field ?? section;
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    const focusable =
      field ??
      section?.querySelector<HTMLElement>("input:not([type=hidden]), textarea, [contenteditable=true]");
    focusable?.focus({ preventScroll: true });
  }, 350);
  const flash = section && !field ? section : (el.closest("[data-slot=field]") as HTMLElement | null) ?? el;
  flash.classList.add(...FLASH);
  window.setTimeout(() => flash.classList.remove(...FLASH), 1600);
}
