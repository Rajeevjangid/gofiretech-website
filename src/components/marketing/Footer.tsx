'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useBranding } from '@/hooks/useBranding'
import { useTheme } from 'next-themes'

// ── Default contact/social info ────────────────────────────────────────────
const FOOTER_DEFAULTS = {
  description: 'Skills Today. Success Tomorrow. India\'s premier technology career platform for the next generation of tech professionals.',
  email:       'info@gofiretech.com',
  phone:       '+91 99999 99999',
  address:     'India',
  instagram:   '',
  facebook:    '',
  linkedin:    '',
  youtube:     '',
  twitter:     '',
}

const programs = [
  { label: 'Ethical Hacking & Cybersecurity',  href: '/courses/ethical-hacking-cybersecurity' },
  { label: 'AI & Machine Learning',             href: '/courses/ai-machine-learning-python' },
  { label: 'Full-Stack Web Development',        href: '/courses/full-stack-web-development' },
  { label: 'Cloud Computing',                   href: '/courses/cloud-computing' },
]

const company = [
  { label: 'About Us',          href: '/about' },
  { label: 'Blog',              href: '/blog' },
  { label: 'Contact',           href: '/contact' },
  { label: 'Placement Records', href: '/about#placements' },
  { label: 'Student Portal',    href: '/portal/login' },
]

const legal = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy',    href: '/refund' },
]

const linkCls = 'text-[13px] transition-colors duration-150 hover:text-foreground text-foreground-3'

export default function Footer() {
  const [info, setInfo] = useState(FOOTER_DEFAULTS)
  const { data: branding } = useBranding()
  const headerLogo = branding['branding.footer_logo'] || branding['branding.header_logo'] || '/logo-dark.webp'
  
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/homepage')
      .then(r => r.json())
      .then(data => {
        if (data['homepage.footer']) {
          setInfo({ ...FOOTER_DEFAULTS, ...data['homepage.footer'] })
        }
      })
      .catch(() => {})
  }, [])

  const currentLogo = mounted && resolvedTheme === 'light' ? '/logo-light.webp' : headerLogo

  return (
    <footer className="border-t border-border bg-background">
      <div className="container-pad py-16 lg:py-20">
        <div className="grid lg:grid-cols-4 gap-10 lg:gap-14">

          {/* ── Brand column ── */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5" aria-label="GoFire Tech — home">
              <Image
                src={currentLogo}
                alt="GoFire Tech"
                width={160}
                height={160}
                quality={95}
                className="w-[110px] h-[44px] object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-[13px] leading-[1.7] mb-6 max-w-[260px] text-foreground-3">
              {info.description}
            </p>

            {/* Social links */}
            <div className="flex flex-wrap gap-2.5 mb-6">
              {info.instagram && (
                <a href={info.instagram} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-md border border-border text-foreground-3 hover:text-foreground hover:border-foreground-4 transition-colors">
                  Instagram
                </a>
              )}
              {info.facebook && (
                <a href={info.facebook} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-md border border-border text-foreground-3 hover:text-foreground hover:border-foreground-4 transition-colors">
                  Facebook
                </a>
              )}
              {info.linkedin && (
                <a href={info.linkedin} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-md border border-border text-foreground-3 hover:text-foreground hover:border-foreground-4 transition-colors">
                  LinkedIn
                </a>
              )}
              {info.youtube && (
                <a href={info.youtube} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-md border border-border text-foreground-3 hover:text-foreground hover:border-foreground-4 transition-colors">
                  YouTube
                </a>
              )}
              {info.twitter && (
                <a href={info.twitter} target="_blank" rel="noopener noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-md border border-border text-foreground-3 hover:text-foreground hover:border-foreground-4 transition-colors">
                  Twitter / X
                </a>
              )}
            </div>

            <div className="text-[11.5px] text-foreground-4">
              &copy; {new Date().getFullYear()} GoFire Tech. All rights reserved.
            </div>
          </div>

          {/* ── Programs ── */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] mb-5 text-foreground-4">
              Programs
            </h4>
            <ul className="space-y-3">
              {programs.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={linkCls}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] mb-5 text-foreground-4">
              Company
            </h4>
            <ul className="space-y-3">
              {company.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={linkCls}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact + Legal ── */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] mb-5 text-foreground-4">
              Contact
            </h4>
            <ul className="space-y-2.5 mb-8 text-[13px] text-foreground-3">
              {info.email && (
                <li>
                  <a href={`mailto:${info.email}`} className="hover:text-foreground transition-colors duration-150">
                    {info.email}
                  </a>
                </li>
              )}
              {info.phone && (
                <li>
                  <a href={`tel:${info.phone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors duration-150">
                    {info.phone}
                  </a>
                </li>
              )}
              {info.address && <li>{info.address}</li>}
            </ul>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] mb-5 text-foreground-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {legal.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className={linkCls}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

