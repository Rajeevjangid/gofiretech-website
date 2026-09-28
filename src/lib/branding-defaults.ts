/**
 * Branding CMS — shared keys and defaults.
 * Imported by admin API route, public API route, and the client hook.
 */

export const BRANDING_KEYS = [
  'branding.header_logo',
  'branding.footer_logo',
  'branding.admin_logo',
  'branding.favicon',
] as const

export type BrandingKey = typeof BRANDING_KEYS[number]

export const BRANDING_DEFAULTS: Record<BrandingKey, string> = {
  // logo-dark.webp: RGBA with transparent bg + white logo — correct for dark-mode headers/footers
  // Navbar/Footer/AdminSidebar automatically switch to /logo-light.webp in light mode
  'branding.header_logo': '/logo-dark.webp',
  'branding.footer_logo': '/logo-dark.webp',
  'branding.admin_logo':  '/logo-dark.webp',
  'branding.favicon':     '/favicon.ico',
}
