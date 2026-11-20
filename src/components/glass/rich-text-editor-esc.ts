/** Dialogs call this from onEscapeKeyDown so Escape in the link bar only closes the bar. */
export function keepEscapeForEditor(e: KeyboardEvent) {
  if ((e.target as HTMLElement | null)?.closest?.("[data-rte-keep-esc]")) e.preventDefault();
}
