// Quiet Words lives inside GameHub, which is what gets installed on the home screen.

// Where GameHub's launchpad is. On the home Wi-Fi server (served from the root) that's the
// live site, since the hub isn't running locally.
export const HUB_URL = import.meta.env.BASE_URL === '/' ? 'https://standan3126.github.io/' : '/'

export const isInstalled = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
