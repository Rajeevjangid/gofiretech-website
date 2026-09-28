/**
 * Homepage CMS — shared defaults & allowed keys.
 * Imported by both the admin API and public API routes.
 */

export const HOMEPAGE_DEFAULTS = {
  'homepage.hero': {
    badge:     "India's fastest-growing tech career platform",
    title:     'Build Skills That',
    highlight: 'Get You Hired.',
    subtitle:  'Industry-grade programs in Cybersecurity, AI & ML, and Full-Stack Development — built for students who want real careers, not just certificates.',
    btn1Text:  'Explore Programs',
    btn1Url:   '/courses',
    btn2Text:  'Talk to an Expert',
    btn2Url:   '/contact',
    image:     '',
  },
  'homepage.stats': [
    { value: '2,000+', label: 'Students Trained',     sub: 'Across Tier-1, 2 & 3 cities' },
    { value: '95%',    label: 'Placement Rate',        sub: 'Industry-leading success'    },
    { value: '20+',    label: 'Programs',              sub: 'Industry-aligned curriculum' },
    { value: '₹8L+',   label: 'Avg. Starting Package', sub: 'For placed students'         },
  ],
  'homepage.hero_stats': [
    { value: '2,000+', label: 'Students Trained' },
    { value: '95%',    label: 'Placement Rate'   },
    { value: '20+',    label: 'Programs'          },
    { value: '₹8L+',   label: 'Avg. Package'     },
  ],
  'homepage.about': {
    tag:       'About GoFire Tech',
    title:     'Where Passion Meets\nPurpose.',
    body:      "GoFire Tech was born from a frustrating reality: India has millions of talented young people and a massive tech talent shortage — yet the two never connect. We are the bridge.\n\nOur programs are built by practitioners, not academics. Every module maps directly to a hiring requirement at a real company. When you graduate, you bring proof of work — not just a certificate.",
    image:     '',
    btnText:   'Learn Our Story',
    btnUrl:    '/about',
  },
  'homepage.features': {
    tag:      'What Sets Us Apart',
    title:    'Everything You Need\nto Get Hired.',
    subtitle: 'From day one, every element of our programs is designed with one goal: your first or next tech job.',
  },
  'homepage.feature_cards': [
    { id: 'f1', title: 'Practitioner-Led Training',    desc: 'Every instructor is an active industry professional with 5+ years of real-world experience in their domain.',           icon: 'Users',        order: 0, active: true },
    { id: 'f2', title: 'Job-Ready Portfolio',          desc: 'Build 3–5 production-quality projects per program. Walk in to interviews with a GitHub and a story.',                  icon: 'Briefcase',    order: 1, active: true },
    { id: 'f3', title: '1-on-1 Mentorship',            desc: 'Weekly dedicated sessions with your assigned mentor. Direct access via WhatsApp for day-to-day doubts.',             icon: 'MessageCircle',order: 2, active: true },
    { id: 'f4', title: 'Placement Guarantee',          desc: 'We are so confident in our curriculum that we offer placement support until you get placed.',                          icon: 'CheckCircle',  order: 3, active: true },
    { id: 'f5', title: 'Industry Network',             desc: '200+ verified hiring partners across IT services, product, and startups. Direct referrals for top performers.',       icon: 'Globe',        order: 4, active: true },
    { id: 'f6', title: 'Lifetime Learning Access',    desc: 'All course updates, new modules, and live sessions are free for life. Your learning never stops after graduation.',    icon: 'BookOpen',     order: 5, active: true },
  ],
  'homepage.why': {
    tag:      'Why GoFire Tech',
    title:    'Built Different.\nResults Different.',
    subtitle: "We're not a coaching center. We're a launchpad — with the infrastructure, mentorship, and industry network to get you hired.",
  },
  'homepage.why_cards': [
    { id: '1', title: 'Industry-Certified Curriculum',  desc: 'Programs aligned with CEH, CompTIA, AWS, and Google certifications. Every module validated by active industry professionals.', icon: 'ShieldCheck',  order: 0, active: true },
    { id: '2', title: 'Live Project Experience',        desc: 'Work on real-world client projects during training. Graduate with a portfolio that speaks louder than any certificate.',        icon: 'Briefcase',    order: 1, active: true },
    { id: '3', title: 'Guaranteed Placement Support',   desc: 'Dedicated placement cell, mock interviews, resume reviews, and direct connections with 200+ hiring partners.',               icon: 'Trophy',       order: 2, active: true },
    { id: '4', title: 'Small Batch Sizes',              desc: 'Maximum 20 students per batch. Every student gets personal mentor attention from day one to placement.',                    icon: 'Users',        order: 3, active: true },
    { id: '5', title: 'Flexible Learning',              desc: 'Weekend and weekday batches available. Lifetime access to recorded sessions so you never miss a concept.',                 icon: 'Clock',        order: 4, active: true },
    { id: '6', title: 'Expert Instructors',             desc: '10+ years of industry experience. Our mentors work at top companies and bring real-world insight to every class.',         icon: 'GraduationCap', order: 5, active: true },
  ],
  'homepage.cta': {
    badge:    'Limited Seats per Batch',
    title:    'Ready to Ignite\nYour Tech Career?',
    subtitle: "Join thousands of students who chose GoFire Tech and launched careers at India's top technology companies.",
    btn1Text: 'Browse Programs',
    btn1Url:  '/courses',
    btn2Text: 'Schedule a Call',
    btn2Url:  '/contact',
    image:    '',
  },
  'homepage.footer': {
    description: "Skills Today. Success Tomorrow. India's premier technology career platform for the next generation of tech professionals.",
    email:       'info@gofiretech.com',
    phone:       '+91 99999 99999',
    address:     'India',
    instagram:   '',
    facebook:    '',
    linkedin:    '',
    youtube:     '',
    twitter:     '',
  },
} as const

export const HOMEPAGE_KEYS = Object.keys(HOMEPAGE_DEFAULTS) as Array<keyof typeof HOMEPAGE_DEFAULTS>
