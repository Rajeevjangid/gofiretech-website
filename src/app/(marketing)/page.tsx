export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import HeroSection      from '@/components/marketing/home/HeroSection'
import StatsSection     from '@/components/marketing/home/StatsSection'
import AboutSection     from '@/components/marketing/home/AboutSection'
import FeaturedCourses  from '@/components/marketing/home/FeaturedCourses'
import FeaturesSection  from '@/components/marketing/home/FeaturesSection'
import WhyGoFire        from '@/components/marketing/home/WhyGoFire'
import Testimonials     from '@/components/marketing/home/Testimonials'
import LatestBlog       from '@/components/marketing/home/LatestBlog'
import CtaBanner        from '@/components/marketing/home/CtaBanner'

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata('home', {
    title:       'GoFire Tech — Skills Today. Success Tomorrow.',
    description: 'Industry-grade programs in Cybersecurity, AI & Machine Learning, and Full-Stack Development. Join 2,000+ students who launched their tech careers with GoFire Tech.',
    keywords:    'cybersecurity course india, AI ML course, full stack development, tech career, GoFire Tech, placement guarantee, ethical hacking',
  })
}

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <FeaturedCourses />
      <FeaturesSection />
      <WhyGoFire />
      <Testimonials />
      <LatestBlog />
      <CtaBanner />
    </div>
  )
}
