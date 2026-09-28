/**
 * useHomepageData — shared client-side hook.
 * Fetches /api/homepage once (module-level cache) and returns merged CMS data.
 * Components start with hardcoded defaults → zero layout shift.
 */
'use client'

import { useEffect, useState } from 'react'
import { HOMEPAGE_DEFAULTS } from '@/lib/homepage-defaults'

export type HomepageData = typeof HOMEPAGE_DEFAULTS

// Module-level cache so the fetch fires only once per page load
let _cache: HomepageData | null = null
let _fetchPromise: Promise<HomepageData> | null = null

async function fetchHomepageData(): Promise<HomepageData> {
  if (_cache) return _cache
  if (_fetchPromise) return _fetchPromise

  _fetchPromise = fetch('/api/homepage')
    .then(r => r.json())
    .then(data => {
      // Merge API response with defaults (API already does this, but be safe)
      _cache = { ...HOMEPAGE_DEFAULTS, ...data } as HomepageData
      return _cache!
    })
    .catch(() => {
      _cache = { ...HOMEPAGE_DEFAULTS } as HomepageData
      return _cache!
    })

  return _fetchPromise
}

export function useHomepageData() {
  const [data, setData] = useState<HomepageData>(HOMEPAGE_DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomepageData()
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
