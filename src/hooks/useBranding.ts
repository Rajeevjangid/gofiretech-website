'use client'

import { useEffect, useState } from 'react'
import { BRANDING_DEFAULTS } from '@/lib/branding-defaults'

export type { BrandingKey } from '@/lib/branding-defaults'

export interface BrandingData {
  'branding.header_logo': string
  'branding.footer_logo': string
  'branding.admin_logo':  string
  'branding.favicon':     string
}

// Module-level cache — one fetch per page session across all components
let _cache: BrandingData | null = null
let _promise: Promise<BrandingData> | null = null

async function fetchBranding(): Promise<BrandingData> {
  if (_cache) return _cache
  if (_promise) return _promise

  _promise = fetch('/api/branding')
    .then(r => r.json())
    .then((d: Partial<BrandingData>) => {
      _cache = { ...BRANDING_DEFAULTS, ...d } as BrandingData
      return _cache
    })
    .catch((): BrandingData => {
      _cache = { ...BRANDING_DEFAULTS } as BrandingData
      return _cache
    })

  return _promise
}

export function useBranding() {
  const [data, setData]       = useState<BrandingData>(BRANDING_DEFAULTS as BrandingData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBranding()
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
