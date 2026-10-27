// Types for the GameHub toolbox (plain JavaScript in ../hub/shared/v1, bundled in as @shared).

declare module '@shared/secret.js' {
  // True if the code is the family code that opens grown-up tools.
  export function checkCode(code: string): Promise<boolean>
}

declare module '@shared/kit.js' {
  export const HUB_URL: string
  // Saves every file in the list for offline play, in the background.
  export function warmOffline(listUrl: string): Promise<void>
}
