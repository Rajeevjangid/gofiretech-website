'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Loader2 } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  course: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

const courseOptions = [
  'Ethical Hacking & Cybersecurity',
  'AI & Machine Learning Fundamentals',
  'Full-Stack Web Development with AI',
  'Cloud Security & DevSecOps',
  'GenAI & Prompt Engineering',
  'Python for Data Science',
  'Not sure yet — need guidance',
]

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'info@gofiretech.com', href: 'mailto:info@gofiretech.com' },
  { icon: Phone, label: 'Phone / WhatsApp', value: '+91 99999 99999', href: 'tel:+919999999999' },
  { icon: MapPin, label: 'Location', value: 'India (Online & Offline)', href: '#' },
  { icon: Clock, label: 'Response Time', value: 'Within 24 hours', href: '#' },
]

export default function ContactPageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (res.ok) {
        toast.success(result.message || 'Message sent! We will contact you shortly.')
        setSubmitted(true)
        reset()
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative pt-32 pb-16 border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="container-gf relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="badge-gf mb-4">Get In Touch</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
              Start your{' '}
              <span className="text-gradient">tech journey today</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Book a free demo class, ask about a course, or just say hello.
              Our counselors respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-gf py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left: Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Contact Information</h2>
              <p className="text-sm text-muted-foreground">We&apos;re here to help you make the right career decision.</p>
            </div>
            <div className="space-y-4">
              {contactInfo.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-start gap-4 glass-card rounded-xl p-4 hover:border-[#FF5A1F]/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-[#FF5A1F]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919999999999?text=Hi%20GoFire%20Tech%2C%20I%20want%20to%20book%20a%20free%20demo%20class."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-500/20 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Message Received! 🎉</h3>
                  <p className="text-muted-foreground mb-6">Our counselor will contact you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-gf-primary px-6 py-3 rounded-xl text-sm font-semibold relative overflow-hidden"
                  >
                    <span className="relative z-10">Send Another Message</span>
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-6">Book a Free Demo / Send Inquiry</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                        <input
                          {...register('name')}
                          placeholder="Your full name"
                          className="w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
                        />
                        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Email Address *</label>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="your@email.com"
                          className="w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
                        />
                        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Phone / WhatsApp</label>
                        <input
                          {...register('phone')}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Course of Interest</label>
                        <select
                          {...register('course')}
                          className="w-full h-11 px-4 rounded-xl border border-input bg-input/50 text-sm text-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors"
                        >
                          <option value="">Select a course...</option>
                          {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
                      <textarea
                        {...register('message')}
                        rows={5}
                        placeholder="Tell us about your background, career goals, or any questions you have..."
                        className="w-full px-4 py-3 rounded-xl border border-input bg-input/50 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors resize-none"
                      />
                      {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-gf-primary py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin relative z-10" /><span className="relative z-10">Sending...</span></>
                      ) : (
                        <><Send className="w-5 h-5 relative z-10" /><span className="relative z-10">Send Message</span></>
                      )}
                    </button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting, you agree to our privacy policy. We never spam.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
