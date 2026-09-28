import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'GoFireAdmin2024!',
    12
  )

  const admin = await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@gofiretech.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@gofiretech.com',
      name: 'GoFire Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Seed courses
  const courses = [
    {
      title: 'Ethical Hacking & Cybersecurity',
      slug: 'ethical-hacking-cybersecurity',
      description: 'Master penetration testing, network security, and ethical hacking. CEH exam preparation included. Learn to think like an attacker to defend like a pro.',
      price: 39999,
      originalPrice: 59999,
      duration: '12 Weeks',
      level: 'BEGINNER' as const,
      category: 'Cybersecurity',
      tags: 'ethical hacking,CEH,penetration testing,network security,cybersecurity',
      isFeatured: true,
      isPublished: true,
      instructor: 'Rajesh Kumar',
      instructorBio: 'Former cybersecurity lead with 10+ years experience at Fortune 500 companies. CEH certified.',
      enrollmentCount: 342,
      rating: 4.9,
      order: 1,
      metaTitle: 'Ethical Hacking & Cybersecurity Course | GoFire Tech',
      metaDescription: 'Master ethical hacking and cybersecurity with GoFire Tech. Includes CEH prep, penetration testing, network security. 75%+ placement rate.',
    },
    {
      title: 'AI & Machine Learning Fundamentals',
      slug: 'ai-machine-learning-fundamentals',
      description: 'From Python basics to deploying ML models. Learn TensorFlow, PyTorch, Scikit-learn, and build real AI projects that matter.',
      price: 44999,
      originalPrice: 69999,
      duration: '10 Weeks',
      level: 'INTERMEDIATE' as const,
      category: 'Artificial Intelligence',
      tags: 'AI,machine learning,Python,TensorFlow,PyTorch,deep learning',
      isFeatured: true,
      isPublished: true,
      instructor: 'Priya Sharma',
      instructorBio: 'AI researcher and practitioner. Previously at Google Brain. PhD in ML from IIT.',
      enrollmentCount: 289,
      rating: 4.8,
      order: 2,
      metaTitle: 'AI & Machine Learning Course | GoFire Tech',
      metaDescription: 'Learn AI and Machine Learning from scratch. Build real ML models with TensorFlow and PyTorch. Job-ready in 10 weeks.',
    },
    {
      title: 'Full-Stack Web Development with AI',
      slug: 'fullstack-web-development',
      description: 'Master React, Node.js, TypeScript, and integrate AI tools. Build 5 production-grade projects and deploy them to the cloud.',
      price: 49999,
      originalPrice: 74999,
      duration: '16 Weeks',
      level: 'BEGINNER' as const,
      category: 'Web Development',
      tags: 'React,Node.js,TypeScript,full-stack,web development',
      isFeatured: true,
      isPublished: true,
      instructor: 'Arun Patel',
      instructorBio: 'Senior full-stack engineer with 8+ years of experience. Built products used by millions.',
      enrollmentCount: 421,
      rating: 4.9,
      order: 3,
      metaTitle: 'Full-Stack Web Development Course | GoFire Tech',
      metaDescription: 'Learn full-stack web development with React, Node.js and TypeScript. Build real projects and get placed.',
    },
    {
      title: 'GenAI & Prompt Engineering for Developers',
      slug: 'genai-prompt-engineering',
      description: 'Learn to build GenAI applications using GPT-4, Gemini, Claude. Prompt engineering, RAG systems, and AI agents.',
      price: 19999,
      originalPrice: 29999,
      duration: '6 Weeks',
      level: 'BEGINNER' as const,
      category: 'Artificial Intelligence',
      tags: 'GenAI,prompt engineering,GPT-4,Gemini,RAG,AI agents',
      isFeatured: true,
      isPublished: true,
      instructor: 'Neha Singh',
      instructorBio: 'AI product builder. Founded 2 AI startups. Specialist in LLMs and prompt engineering.',
      enrollmentCount: 534,
      rating: 5.0,
      order: 4,
    },
  ]

  for (const course of courses) {
    await db.course.upsert({
      where: { slug: course.slug },
      update: {},
      create: course,
    })
    console.log(`✅ Course seeded: ${course.title}`)
  }

  // Seed testimonials
  const testimonials = [
    {
      name: 'Rahul Verma',
      role: 'Cybersecurity Analyst',
      company: 'TCS',
      content: 'GoFire Tech completely changed my career trajectory. I was a BCA fresher with no job for 8 months. After their Cybersecurity course, I got placed at TCS with a 6 LPA package.',
      rating: 5,
      isPublished: true,
      order: 1,
    },
    {
      name: 'Sneha Iyer',
      role: 'AI/ML Engineer',
      company: 'Infosys',
      content: 'The AI course at GoFire Tech is unlike anything else I tried. Real projects, real datasets, real Python. Landed my first AI role within 3 months of graduation.',
      rating: 5,
      isPublished: true,
      order: 2,
    },
    {
      name: 'Mohammed Aziz',
      role: 'Full-Stack Developer',
      company: 'Startup (Remote)',
      content: "GoFire Tech's weekend batch made it possible without quitting my job. In 4 months I was deploying React apps. Now I earn 2.5x my old salary working remotely.",
      rating: 5,
      isPublished: true,
      order: 3,
    },
  ]

  for (const testimonial of testimonials) {
    await db.testimonial.create({ data: testimonial }).catch(() => {})
    console.log(`✅ Testimonial seeded: ${testimonial.name}`)
  }

  // Seed blog posts
  const blogPosts = [
    {
      title: 'Top 10 Cybersecurity Skills Every Fresher Must Learn in 2024',
      slug: 'top-10-cybersecurity-skills-2024',
      excerpt: 'Cybersecurity is one of the fastest-growing career fields in India. Here are the 10 essential skills that will help you land your first security role.',
      content: `<h2>Why Cybersecurity?</h2><p>India faces over 13 lakh cybersecurity job vacancies with very few qualified professionals to fill them. This gap represents a massive opportunity for freshers willing to invest in the right skills.</p><h2>The Top 10 Skills</h2><ol><li><strong>Network Security Fundamentals</strong> — Understanding TCP/IP, firewalls, VPNs, and intrusion detection systems is non-negotiable.</li><li><strong>Linux Command Line</strong> — Almost all security tools run on Linux. Master the terminal before anything else.</li><li><strong>Python for Security Automation</strong> — Write scripts to automate vulnerability scans, log analysis, and more.</li><li><strong>Ethical Hacking & Penetration Testing</strong> — Learn to think like an attacker using tools like Metasploit, Burp Suite, and Nmap.</li><li><strong>OWASP Top 10</strong> — Understand the most critical web application vulnerabilities every developer and security professional must know.</li><li><strong>Cloud Security Basics</strong> — AWS, Azure, and GCP security misconfigurations are responsible for major breaches.</li><li><strong>SIEM Tools</strong> — Experience with Splunk or Microsoft Sentinel is increasingly requested by employers.</li><li><strong>Incident Response</strong> — Know how to contain, eradicate, and recover from a security incident.</li><li><strong>Digital Forensics</strong> — Learn to collect and analyze evidence without destroying it.</li><li><strong>Compliance & Governance</strong> — ISO 27001, SOC 2, and GDPR knowledge opens doors to GRC roles.</li></ol><h2>Getting Certified</h2><p>CEH (Certified Ethical Hacker) and CompTIA Security+ are the most recognized entry-level certifications. At GoFire Tech, our cybersecurity program prepares you for the CEH exam while giving you hands-on lab experience.</p><h2>Final Thoughts</h2><p>The best time to start your cybersecurity journey was yesterday. The second best time is today. Start with networking fundamentals, move to Linux, and then pick a specialization like pentesting or cloud security.</p>`,
      category: 'Cybersecurity',
      tags: 'cybersecurity,ethical hacking,CEH,career,freshers',
      authorName: 'Rajesh Kumar',
      isPublished: true,
      isFeatured: true,
      readTime: 7,
      views: 1243,
      publishedAt: new Date('2024-06-15'),
      metaTitle: 'Top 10 Cybersecurity Skills for Freshers 2024 | GoFire Tech',
      metaDescription: 'Discover the top 10 cybersecurity skills every fresher must learn in 2024. From networking to Python scripting and CEH certification prep.',
    },
    {
      title: 'How I Went from BCA Fresher to AI Engineer at Infosys in 4 Months',
      slug: 'bca-fresher-to-ai-engineer-story',
      excerpt: "A real success story about how structured learning, the right mentorship, and consistent practice transformed a career. Sneha's journey from unemployed graduate to ML Engineer.",
      content: `<h2>The Starting Point</h2><p>In January 2024, I was a BCA graduate from Nagpur with no job, no portfolio, and no idea where to start. Like thousands of freshers, I had theoretical knowledge but zero practical skills that companies actually needed.</p><h2>Why I Chose AI/ML</h2><p>After researching job portals for weeks, I noticed something: AI/ML roles were paying 2x compared to traditional software development, and the skill gap was enormous. Companies were desperately hiring but couldn't find candidates.</p><h2>The Learning Path</h2><p>I enrolled in GoFire Tech's AI & Machine Learning program. Here's what the journey looked like:</p><ul><li><strong>Month 1:</strong> Python fundamentals, NumPy, Pandas, data manipulation</li><li><strong>Month 2:</strong> Machine learning with Scikit-learn, supervised/unsupervised algorithms</li><li><strong>Month 3:</strong> Deep learning with TensorFlow, neural networks, CNNs</li><li><strong>Month 4:</strong> Real project — built a fraud detection model using actual financial data</li></ul><h2>The Interview Process</h2><p>With my fraud detection project on GitHub and a clear understanding of ML concepts, I applied to 23 companies. I got 7 interview calls, cleared 3 rounds, and received 2 offers. I accepted Infosys AI Lab at 6.5 LPA.</p><h2>What Made the Difference</h2><p>The biggest differentiator was having a real project to talk about. Interviewers don't want theory — they want to see that you've solved actual problems with data. The mentorship at GoFire Tech was crucial for this.</p><h2>Advice for Freshers</h2><p>Stop waiting for the "perfect time." Build something. Put it on GitHub. Write about it. Apply. The job market rewards people who show initiative, not those who wait to feel ready.</p>`,
      category: 'Success Stories',
      tags: 'AI,machine learning,career switch,success story,fresher',
      authorName: 'Sneha Iyer',
      isPublished: true,
      isFeatured: true,
      readTime: 6,
      views: 2891,
      publishedAt: new Date('2024-07-02'),
      metaTitle: 'BCA Fresher to AI Engineer in 4 Months | GoFire Tech Success Story',
      metaDescription: "Read how Sneha went from unemployed BCA graduate to AI Engineer at Infosys in just 4 months with GoFire Tech's ML program.",
    },
    {
      title: 'React vs Angular vs Vue in 2024: Which Should You Learn First?',
      slug: 'react-vs-angular-vs-vue-2024',
      excerpt: 'Choosing the right JavaScript framework can feel overwhelming. We break down the job market reality, learning curve, and which one gives you the fastest path to employment in India.',
      content: `<h2>The Framework War (And Why It Doesn't Matter as Much as You Think)</h2><p>Every year, this debate resurfaces. React vs Angular vs Vue. The truth is: any of them will get you hired. But there are practical differences that matter when you're starting out.</p><h2>Market Reality in India (2024)</h2><p>Looking at 50,000+ job listings on Naukri and LinkedIn, here's the breakdown:</p><ul><li><strong>React:</strong> 68% of frontend job listings</li><li><strong>Angular:</strong> 22% of frontend job listings</li><li><strong>Vue:</strong> 10% of frontend job listings</li></ul><p>React wins by a massive margin. If your goal is maximum job opportunities in the shortest time, learn React.</p><h2>React — Best for Job Seekers</h2><p><strong>Pros:</strong> Largest ecosystem, most jobs, backed by Meta, huge community, Next.js for full-stack<br/><strong>Cons:</strong> Opinionated ecosystem decisions left to you, can be overwhelming at first<br/><strong>Best for:</strong> Startups, product companies, freelancers</p><h2>Angular — Best for Enterprise Jobs</h2><p><strong>Pros:</strong> Opinionated (decisions made for you), TypeScript first-class, strong in banking/finance<br/><strong>Cons:</strong> Steeper learning curve, verbose, fewer startup jobs<br/><strong>Best for:</strong> Service companies like TCS, Infosys, Wipro; banking projects</p><h2>Vue — Best for Learning</h2><p><strong>Pros:</strong> Gentlest learning curve, excellent documentation, loved by developers<br/><strong>Cons:</strong> Fewer jobs in India specifically, smaller community<br/><strong>Best for:</strong> Developers who want to understand frontend concepts deeply before specializing</p><h2>Our Recommendation</h2><p>Learn React. Here's a realistic 3-month plan:</p><ol><li><strong>Month 1:</strong> HTML, CSS, JavaScript fundamentals (non-negotiable foundation)</li><li><strong>Month 2:</strong> React basics — components, state, props, hooks, routing</li><li><strong>Month 3:</strong> Build 2 full projects, deploy them, learn Next.js basics</li></ol><p>With this foundation and a deployed portfolio, you're competitive for junior React developer roles paying ₹4-8 LPA.</p>`,
      category: 'Web Development',
      tags: 'React,Angular,Vue,JavaScript,web development,frontend',
      authorName: 'Arun Patel',
      isPublished: true,
      isFeatured: false,
      readTime: 8,
      views: 1567,
      publishedAt: new Date('2024-07-18'),
      metaTitle: 'React vs Angular vs Vue 2024: Which to Learn First? | GoFire Tech',
      metaDescription: 'Data-driven comparison of React, Angular, and Vue for Indian job market 2024. Learn which framework gives you the fastest path to employment.',
    },
  ]

  for (const post of blogPosts) {
    await db.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
    console.log(`✅ Blog post seeded: ${post.title}`)
  }

  // Seed SEO settings
  const seoSettings = [
    {
      page: 'home',
      title: 'GoFire Tech — Skills Today. Success Tomorrow.',
      description: "India's most outcome-driven technology career platform. Master Cybersecurity, AI, and Web Development.",
      keywords: 'cybersecurity course, AI training, web development, tech career India, ethical hacking',
    },
    {
      page: 'courses',
      title: 'All Courses — Cybersecurity, AI & Web Development | GoFire Tech',
      description: 'Browse GoFire Tech programs. Industry-led courses with placement support.',
    },
    {
      page: 'blog',
      title: 'Blog — Tech Career Insights | GoFire Tech',
      description: 'Latest tech career insights, tutorials, and industry news from GoFire Tech experts.',
    },
    {
      page: 'about',
      title: 'About GoFire Tech — Our Mission & Story',
      description: "Learn about GoFire Tech's mission to democratize technology education in India.",
    },
    {
      page: 'contact',
      title: 'Contact Us — Book a Free Demo Class | GoFire Tech',
      description: 'Reach out to GoFire Tech for admissions, course queries, or to book your free demo class.',
    },
  ]

  for (const seo of seoSettings) {
    await db.seoSetting.upsert({
      where: { page: seo.page },
      update: {},
      create: seo,
    })
  }
  console.log('✅ SEO settings seeded')

  // Seed site settings
  const settings = [
    { key: 'site_name', value: 'GoFire Tech' },
    { key: 'site_tagline', value: 'Skills Today. Success Tomorrow.' },
    { key: 'site_email', value: 'info@gofiretech.com' },
    { key: 'site_phone', value: '+91 99999 99999' },
    { key: 'site_address', value: 'India (Online & Offline batches available)' },
    { key: 'social_twitter', value: 'https://twitter.com/gofiretech' },
    { key: 'social_linkedin', value: 'https://linkedin.com/company/gofiretech' },
    { key: 'social_instagram', value: 'https://instagram.com/gofiretech' },
    { key: 'social_youtube', value: 'https://youtube.com/@gofiretech' },
    { key: 'whatsapp_number', value: '919999999999' },
  ]

  for (const setting of settings) {
    await db.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Site settings seeded')

  console.log('\n🔥 Seed complete! GoFire Tech database is ready.')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
