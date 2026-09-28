'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import MediaPicker from '@/components/admin/MediaPicker'

const pages = [
  { key: 'home',    label: 'Homepage',   path: '/'        },
  { key: 'courses', label: 'Courses',    path: '/courses' },
  { key: 'blog',    label: 'Blog',       path: '/blog'    },
  { key: 'notes',   label: 'Notes',      path: '/notes'   },
  { key: 'about',   label: 'About',      path: '/about'   },
  { key: 'contact', label: 'Contact',    path: '/contact' },
]

export default function AdminSeoPage() {
  const [activePage, setActivePage] = useState('home')
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/seo')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, any> = {}
        data.forEach((s: any) => { map[s.page] = s })
        setSettings(map)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const current = settings[activePage] || {}

  const update = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [activePage]: { ...prev[activePage], [field]: value },
    }))
  }

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: activePage, ...current }),
    })
    if (res.ok) toast.success('SEO settings saved!')
    else toast.error('Failed to save')
    setSaving(false)
  }

  return (
    <div className="page-transition space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">SEO Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage meta tags and SEO settings for each page</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Page selector */}
        <div className="glass-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pages</h2>
          <div className="space-y-1">
            {pages.map(page => (
              <button key={page.key} onClick={() => setActivePage(page.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activePage === page.key
                    ? 'bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                }`}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <div>
                    <p>{page.label}</p>
                    <p className="text-[10px] text-muted-foreground">{page.path}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A1F]" /></div>
          ) : (
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-foreground">
                  {pages.find(p => p.key === activePage)?.label} — SEO Settings
                </h2>
                <button onClick={save} disabled={saving}
                  className="flex items-center gap-2 btn-gf-primary px-4 py-2 rounded-xl text-sm font-semibold relative overflow-hidden disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <Save className="w-4 h-4 relative z-10" />}
                  <span className="relative z-10">{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>

              {[
                {
                  field: 'title', label: 'Meta Title', type: 'input',
                  placeholder: 'Page title (50-60 chars recommended)',
                }, {
                  field: 'description', label: 'Meta Description', type: 'textarea',
                  placeholder: 'Page description (150-160 chars recommended)',
                }, {
                  field: 'keywords', label: 'Keywords', type: 'input',
                  placeholder: 'keyword1, keyword2, keyword3',
                },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={current[field] || ''}
                      onChange={e => update(field, e.target.value)}
                      rows={3}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] resize-none transition-colors"
                    />
                  ) : (
                    <input
                      type="text"
                      value={current[field] || ''}
                      onChange={e => update(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
                    />
                  )}
                  {field === 'title' && (
                    <p className={`mt-1 text-xs ${ (current[field] || '').length > 60 ? 'text-yellow-400' : 'text-muted-foreground' }`}>
                      {(current[field] || '').length}/60 characters
                    </p>
                  )}
                  {field === 'description' && (
                    <p className={`mt-1 text-xs ${ (current[field] || '').length > 160 ? 'text-yellow-400' : 'text-muted-foreground' }`}>
                      {(current[field] || '').length}/160 characters
                    </p>
                  )}
                </div>
              ))}

              {/* OG Image via MediaPicker */}
              <MediaPicker
                label="OG Image"
                value={current.ogImage || null}
                onChange={url => update('ogImage', url ?? '')}
              />

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="noindex" checked={current.noIndex || false}
                  onChange={e => update('noIndex', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 rounded border border-border accent-[#FF5A1F]" />
                <label htmlFor="noindex" className="text-sm text-foreground">No-index this page (hide from search engines)</label>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 rounded-xl bg-background border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Google Preview</p>
                <div>
                  <p className="text-blue-400 text-sm font-medium hover:underline cursor-pointer">
                    {current.title || 'Page Title'}
                  </p>
                  <p className="text-green-600 text-xs">https://gofiretech.com{pages.find(p => p.key === activePage)?.path}</p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {current.description || 'Meta description will appear here.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
