/**
 * Default homepage CMS payloads — mirrors the current static frontend copy
 * so seeding restores what the marketing site already shows.
 */

export const homepageSeedSections = [
  {
    key: "hero",
    label: "Hero",
    content: {
      pillHtml: "Rated <b>4.8</b> by 300+ store owners",
      headlineLines: [
        "Your E-commerce",
        "Growth Partner",
        "All in One Place.",
      ],
      lede: "Listings, creative, ads and SEO across Amazon, Shopify, Meta, Google and TikTok — handled by one team on a single monthly retainer, so you can stay on the product.",
      primaryCta: { label: "Get Started", href: "/#pricing" },
      secondaryCta: { label: "See our work", href: "/#recent-projects-heading" },
      sides: [
        {
          slot: 4,
          name: "Amazon management",
          note: "Listings, A+ content, PPC, reviews",
        },
        {
          slot: 1,
          name: "Shopify & store design",
          note: "Build, theme, speed, CRO",
        },
        {
          slot: 5,
          name: "Creative & packaging",
          note: "Graphics, product & 3D visuals",
        },
        {
          slot: 0,
          name: "Ads, SEO & retention",
          note: "Google, Meta, TikTok, email",
        },
      ],
      channels: ["Amazon", "Shopify", "Google Ads", "Meta", "TikTok"],
      stats: [
        { value: 300, suffix: "+", label: "brands scaled since 2017" },
        {
          value: 50,
          prefix: "$",
          suffix: "M+",
          label: "We Generated Revenue for our clients",
        },
        { value: 20, suffix: "+ channels", label: "run from one umbrella" },
      ],
    },
  },
  {
    key: "stats",
    label: "Stats / Numbers",
    content: {
      pill: "Our Numbers Speak",
      items: [
        {
          icon: "Video",
          value: "Build",
          label: "Product listings",
          description: "storefronts & brand assets",
          accent: "emerald",
        },
        {
          icon: "Users",
          value: "Create",
          label: "3D visuals",
          description: "product photography, video & ad creatives",
          accent: "violet",
        },
        {
          icon: "Award",
          value: "Grow",
          label: "Amazon",
          description: "Amazon, Meta, Google & TikTok advertising.",
          accent: "blue",
        },
        {
          icon: "ThumbsUp",
          value: "Optimize",
          label: "SEO",
          description:
            "Conversion optimization & ongoing performance improvements",
          accent: "orange",
        },
      ],
    },
  },
  {
    key: "brands",
    label: "Brand logos marquee",
    content: {
      brands: [
        { name: "COLLECTIVE AROMAS Co", logo: "/uploads/assets/images/brands/1.png" },
        { name: "KOXAL", logo: "/uploads/assets/images/brands/2.png" },
        { name: "PHEROMEN", logo: "/uploads/assets/images/brands/3.png" },
        { name: "MUSK&CO.", logo: "/uploads/assets/images/brands/4.png" },
        { name: "PATÉLLE", logo: "/uploads/assets/images/brands/5.png" },
        { name: "عطور كابول", logo: "/uploads/assets/images/brands/6.png" },
        { name: "COLLECTIVE AROMAS Co.", logo: "/uploads/assets/images/brands/7.png" },
        { name: "GLACIER SUISSE", logo: "/uploads/assets/images/brands/8.png" },
        { name: "PAST PARFUMS", logo: "/uploads/assets/images/brands/9.png" },
        { name: "BLED BACKHOME", logo: "/uploads/assets/images/brands/10.png" },
        { name: "GIVA", logo: "/uploads/assets/images/brands/11.png" },
        { name: "TOURI", logo: "/uploads/assets/images/brands/12.png" },
        { name: "OLLA", logo: "/uploads/assets/images/brands/13.png" },
      ],
    },
  },
  {
    key: "process",
    label: "Process steps",
    content: {
      pill: "Our Process",
      headline: "How We Turn Ideas",
      headlineAccent: "Into Powerful Solutions",
      description:
        "A clear, collaborative process built to deliver quality, speed, and measurable results.",
      steps: [
        {
          number: "01",
          stepFraction: "1/5",
          badge: "FOUNDATION",
          title: "Discover & Understand",
          description:
            "We learn about your business, goals, audience, and challenges. This gives us the clarity to build the right solution—not just a beautiful one.",
          icon: "Search",
        },
        {
          number: "02",
          stepFraction: "2/5",
          badge: "STRATEGY",
          title: "Plan & Strategize",
          description:
            "We define the creative direction, solution, timeline, and deliverables. You see the plan before production begins, so everyone stays aligned.",
          icon: "Compass",
        },
        {
          number: "03",
          stepFraction: "3/5",
          badge: "PRODUCTION",
          title: "Create & Build",
          description:
            "Our team brings the idea to life—from graphics and video to websites and digital solutions. Every detail is designed and developed with purpose.",
          icon: "Scissors",
        },
        {
          number: "04",
          stepFraction: "4/5",
          badge: "QUALITY",
          title: "Review & Refine",
          description:
            "You review the work, share your feedback, and we refine it until everything feels right. We focus on the details that make the final result stronger.",
          icon: "Eye",
        },
        {
          number: "05",
          stepFraction: "5/5",
          badge: "RESULTS",
          title: "Launch & Grow",
          description:
            "We deliver everything ready to use, launch your project, and help you move forward. We can also support your next campaign, update, or digital solution.",
          icon: "Rocket",
        },
      ],
    },
  },
  {
    key: "recentProjects",
    label: "Recent projects / videos",
    content: {
      eyebrow: "WATCH & LEARN",
      headline: "Insights That",
      headlineAccent: "Move Business Forward",
      description:
        "Explore our videos on Amazon, Shopify, graphic design, e-commerce, branding, and the digital strategies shaping modern businesses.",
      projects: [
        {
          id: "amazon-content-2",
          title: "Create A+ Content on Amazon",
          videoUrl:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/f_auto,q_auto/v1788617086/Create_A_content_on_Amazon_2.mp4",
          thumbnail:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/so_0,f_auto,q_auto/v1788617086/Create_A_content_on_Amazon_2.jpg",
        },
        {
          id: "shopify-importance-2",
          title: "The Importance of Shopify for E-Commerce Growth",
          videoUrl:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/f_auto,q_auto/v1788617089/Importance_of_Shopify_2.mp4",
          thumbnail:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/so_0,f_auto,q_auto/v1788617089/Importance_of_Shopify_2.jpg",
        },
        {
          id: "why-need-website-2",
          title: "Why Your Brand Needs a Professional Website",
          videoUrl:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/f_auto,q_auto/v1788617088/Why_you_need_a_Website.mp4",
          thumbnail:
            "https://res.cloudinary.com/cnjo4gnb/video/upload/so_0,f_auto,q_auto/v1788617088/Why_you_need_a_Website.jpg",
        },
      ],
    },
  },
  {
    key: "pricing",
    label: "Pricing plans",
    content: {
      pill: "Monthly Retainers",
      headline: "Predictable Growth with",
      headlineAccent: "Flat Monthly Pricing",
      description:
        "No hidden fees, no hourly rates. Just consistent, high-quality content and e-commerce management delivered to your brand every single month.",
      footerPrompt: "Need a custom solution for a large enterprise?",
      footerCtaLabel: "Let's talk.",
      footerCtaHref: "/contact?type=enterprise",
      plans: [
        {
          id: "launch",
          name: "E-Commerce Launch",
          price: "1,500.00",
          period: "/mo",
          description:
            "For startups and growing brands building a strong online presence.",
          features: [
            "Amazon Management & Optimization",
            "Shopify & E-Commerce Support",
            "Graphic & Creative Design",
            "Social Media Management",
            "SEO & Content Strategy",
            "Google, Meta & TikTok Marketing",
            "Product & Packaging Design",
            "Monthly Reporting & Strategy",
          ],
          ctaText: "Get Started",
          ctaHref: "/contact?plan=ecommerce-launch",
        },
        {
          id: "growth",
          name: "E-Commerce Growth",
          price: "2,500.00",
          period: "/mo",
          description:
            "For established brands looking to increase traffic, conversions & sales.",
          isPopular: true,
          popularBadgeText: "MOST POPULAR",
          features: [
            "Full Amazon Growth Support",
            "Shopify & E-Commerce Management",
            "Advanced Graphic & Creative Production",
            "Social Media Management",
            "Advanced SEO & Content Marketing",
            "Google, Meta & TikTok Ads",
            "Product, Packaging & 3D Design",
            "Analytics, CRO & Growth Strategy",
            "Monthly Performance Reporting",
          ],
          ctaText: "Get Started",
          ctaHref: "/contact?plan=ecommerce-growth",
        },
        {
          id: "partner",
          name: "E-Commerce Partner",
          price: "5,000.00",
          period: "/mo",
          description:
            "Your complete outsourced e-commerce & digital marketing team.",
          features: [
            "Complete Amazon Management",
            "Full Shopify & E-Commerce Management",
            "High-Volume Creative & Graphic Support",
            "Social Media & Content Management",
            "Full SEO & Organic Growth",
            "Google, Meta & TikTok Advertising",
            "Product, Packaging & 3D Visualization",
            "Email & Retention Marketing",
            "Analytics, CRO & Conversion Strategy",
            "Dedicated Account Management",
            "Weekly Strategy & Growth Support",
          ],
          ctaText: "Get Started",
          ctaHref: "/contact?plan=ecommerce-partner",
        },
      ],
    },
  },
] as const;
