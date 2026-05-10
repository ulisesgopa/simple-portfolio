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
    title: "Frontend Developer & Technical Operations",
    startDate: "2024-02-14",
    company: "Stream Tech S.A.S.",
    location: "Remote | Bogota, CO",
    description:
      "Led frontend development and technical operations for a streaming infrastructure company, maintaining live TV/radio broadcasting services and building client-facing products.",
    goals: [
      "Operated live TV and radio streaming infrastructure using Ant Media Server, deployed across AWS, Linode, and DonWeb, ensuring uptime for active broadcast channels.",
      "Built frontend interfaces and websites for streaming channel clients using React, Next.js, and Tailwind CSS.",
      "Developed Ticketera MIES, the admin dashboard and public event pages, as the frontend layer integrated with an existing NestJS backend API.",
      "Configured domains, DNS records, SSL layers, and traffic routing with Cloudflare across multiple production deployments.",
      "Participated in Ruta de Emprendimiento 2024, a startup acceleration program focused on product and business model refinement.",
    ],
    currentJob: true,
  },
  {
    title: "Frontend Developer",
    startDate: "2023-12-10",
    endDate: "2026-02-10",
    company: "TBS Wireless Services S.A.S.",
    location: "Remote | Bogotá, CO",
    description:
      "Built the company's public landing page and a full-stack internal CRM that automated billing operations for a Colombian telecom company.",
    goals: [
      "Built a responsive public landing page using React, Next.js, and Tailwind CSS.",
      "Built a full-stack internal CRM that automated receipt generation, replacing 5 to 8 hours of daily manual work with automatic issuance on payment confirmation.",
      "Designed a real-time dashboard with per-collector audit trails, KPI visualization (revenue, overdue accounts, collection rates), and dual sales modes (cash and credit).",
      "Implemented JWT role-based access control for admin and collector roles with Playwright E2E test coverage.",
    ],
    currentJob: false,
  },
  {
    title: "Frontend Developer",
    startDate: "2024-01-10",
    endDate: "2026-01-10",
    company: "Freelance",
    location: "Remote",
    description:
      "Delivered full-stack and frontend solutions for startups, SMEs, and organizations across B2B trade, payments, retail, media, and pet services.",
    goals: [
      "Built LatinBridge, a B2B international trade platform with multilingual routing (ES/EN/PT via next-intl), Supabase auth, admin lead pipeline dashboard, and an AI-powered qualification assistant.",
      "Developed El Club Can, a premium dog training school web presence using TanStack Start + React 19 + Radix UI.",
      "Built Octopay landing page with Next.js 15, React 19, and Framer Motion for a digital payments platform.",
      "Built Tienda Patitas, a full e-commerce system: public storefront (React + Vite + TanStack Query), backend API (Bun + Prisma + PostgreSQL + MercadoPago), and admin dashboard with POS, inventory, customer, and sales management (React + Zustand).",
      "Delivered web presences for Tecnologia Urbana, Negocios Uno, Iwie Agro, Fundación Embajadores Comunitarios, and others.",
    ],
    currentJob: false,
  },
  {
    title: "Technical Support & Microelectronics Specialist",
    startDate: "2016-01-01",
    endDate: "2023-01-01",
    company: "Independent",
    location: "Venezuela",
    description:
      "7 years diagnosing and repairing mobile devices at board level, developing systematic troubleshooting methodologies applied today to frontend debugging.",
    goals: [
      "Diagnosed hardware failures in mobile devices and performed board-level component repair.",
      "Applied systematic root-cause analysis methodologies to resolve complex technical issues.",
      "Managed direct customer support and technical service documentation.",
    ],
    currentJob: false,
  },
];

export default workExperience;
