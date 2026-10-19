interface WorkExperience {
    title: string;
    startDate: string;
    endDate?: string;
    company: string;
    location: string;
    description: string;
    goals: string[];
    currentJob: boolean;
}

const workExperience: WorkExperience[] = [
  {
    title: "Founder & AI Engineer",
    startDate: "2026-07-01",
    company: "Escuela Perritos",
    location: "Buenos Aires, Argentina",
    description:
      "Founded a canine education business and built the software that runs it: one Next.js application combining the public site and an integrated CRM.",
    goals: [
      "Built the landing page and integrated CRM (Next.js 16, Prisma, PostgreSQL) covering leads by service, clients, student files, subscriptions, receipts, walkers, accounting and content.",
      "Automated monthly billing with a daily cron that issues renewal receipts, closes expired packages and flags overdue payments, plus Mercado Pago OAuth, verified webhooks and server-side pricing.",
      "Shipped level-based certifications with PDF certificates, QR codes and public verification, and a daily route builder that orders each walker's pickups and drop-offs.",
      "Developed with a spec-driven, AI-assisted workflow (Claude Code with CLAUDE.md/AGENTS.md project rules), guarded by Vitest permission tests per server action and Playwright E2E runs against an isolated database.",
    ],
    currentJob: true,
  },
  {
    title: "Frontend Developer",
    startDate: "2025-10-01",
    company: "Santo Código",
    location: "Remote | Argentina",
    description:
      "Frontend development at a software development agency, building and maintaining complex web applications for multiple clients.",
    goals: [
      "Develop and optimize user interfaces for multiple complex web applications using React, Next.js, and TypeScript, ensuring code modularity and maintainability.",
      "Collaborate with design and product teams to translate Figma prototypes into highly interactive, accessible, and responsive components with Tailwind CSS.",
      "Improve site performance and SEO through Server Components, efficient caching strategies, and Core Web Vitals optimization.",
    ],
    currentJob: true,
  },
  {
    title: "Co-Founder & Lead Engineer",
    startDate: "2024-02-14",
    company: "Stream Tech",
    location: "Remote | Colombia",
    description:
      "Co-founded a technology company building SaaS products for LatAm businesses (point of sale with electronic invoicing, event management and streaming), leading engineering and technical operations.",
    goals: [
      "Operated live TV and radio streaming infrastructure using Ant Media Server, deployed across AWS, Linode, and DonWeb Cloud, ensuring uptime for active broadcast channels.",
      "Built frontend interfaces and websites for streaming channel clients using React, Next.js, and Tailwind CSS.",
      "Took MiPOS, a DIAN-compliant POS SaaS, to production with its first paying client in Colombia, after a pre-go-live audit that fixed duplicate sales and invoices under concurrency, token rotation and subscription enforcement.",
      "Built MiPOS desktop registers (Electron + embedded PostgreSQL) that sell offline and sync to the cloud seconds after each sale, with Ed25519-signed licenses, serial scales and ESC/POS printing.",
      "Developed Ticketera MIES (5,200+ guests accredited) and evolved it into Event Hub BA, a SaaS for institutions, including the marketing site, dashboard rebrand and a multi-tenant white-label architecture audit.",
      "Configured domains, DNS records, SSL layers, and traffic routing with Cloudflare across multiple production deployments.",
      "Participated in Ruta de Emprendimiento 2024, a startup acceleration program focused on product and business model refinement.",
    ],
    currentJob: true,
  },
  {
    title: "Frontend Developer",
    startDate: "2024-01-10",
    endDate: "2026-01-10",
    company: "Freelance",
    location: "Remote",
    description:
      "Delivered frontend and web solutions for startups, SMEs, and organizations across B2B trade, payments, retail, media, and pet services.",
    goals: [
      "Built LatinBridge, a B2B international trade platform with multilingual routing (ES/EN/PT via next-intl), admin lead pipeline dashboard, and an AI-powered qualification assistant.",
      "Developed El Club Can, a premium dog training school web presence using TanStack Start + React 19 + Radix UI.",
      "Built Octopay landing page with Next.js, and Framer Motion for a digital payments platform.",
      "Built Tienda Patitas, a complete e-commerce system: public storefront (React + Vite + TanStack Query), backend API (Bun + Prisma + PostgreSQL + MercadoPago), and admin dashboard with POS, inventory, customer, and sales management (React + Zustand).",
      "Delivered web presences for Tecnologia Urbana, Negocios Uno, Iwie Agro, Fundación Embajadores Comunitarios, and others.",
    ],
    currentJob: false,
  },
  {
    title: "Frontend Developer",
    startDate: "2023-12-10",
    endDate: "2025-12-10",
    company: "TBS Wireless Services",
    location: "Remote | Colombia",
    description:
      "Partnership building the digital products of a Colombian telecom company: public landing page, internal CRM, and point-of-sale system.",
    goals: [
      "Built a responsive public landing page using React, Next.js, and Tailwind CSS (tbswireless.com).",
      "Built an internal CRM that automated receipt generation with automatic issuance on payment confirmation.",
      "Designed a real-time dashboard with per collector audit trails, KPI visualization (revenue, overdue accounts, collection rates), and dual sales modes (cash and credit).",
      "Developed a point-of-sale system for the Colombian market with DIAN electronic invoicing compliance, deployed at mipos.tbswireless.com.",
    ],
    currentJob: false,
  },
  {
    title: "Audiovisual Infrastructure & Real-Time Streaming Specialist",
    startDate: "2019-01-01",
    endDate: "2025-08-01",
    company: "Freelance / Contract",
    location: "Colombia",
    description:
      "Designed and operated technical infrastructure, internet networks, and real-time streaming servers for television channels, digital media platforms, and live broadcasts.",
    goals: [
      "Handled live multi-camera setups, CCTV operations, and high-fidelity video mapping to professional LED displays for massive corporate and entertainment events.",
      "Expertly managed broadcast-grade hardware switchers (Blackmagic), professional audio interfaces, mixing consoles, and custom live-streaming encoder configurations.",
      "Provided advanced IT technical support tailored specifically to broadcast environments, ensuring zero-downtime streaming transmission.",
    ],
    currentJob: false,
  },
  {
    title: "Technical Support & Microelectronics Specialist",
    startDate: "2016-01-01",
    endDate: "2018-12-01",
    company: "Self-Employed",
    location: "Venezuela",
    description:
      "Diagnosed and repaired mobile devices at board level, developing systematic troubleshooting methodologies applied today to frontend debugging.",
    goals: [
      "Diagnosed hardware failures in mobile devices and performed board-level component repair.",
      "Applied systematic root cause analysis methodologies to resolve complex electronic issues, sharpening debugging habits now applied to software engineering.",
    ],
    currentJob: false,
  },
];

export default workExperience;
