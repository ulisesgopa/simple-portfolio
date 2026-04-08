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
    location: "Remote | Buenos Aires, AR",
    description:
      "Built and maintained frontend interfaces for SaaS and streaming services, while managing cloud infrastructure and production operations.",
    goals: [
      "Developed internal dashboards and frontend interfaces for TV and radio streaming operations using React, Next.js, and Tailwind CSS.",
      "Managed cloud deployments and production services across Linode, AWS, GCP, and Vercel.",
      "Configured domains, DNS records, SSL layers, and traffic routing with Cloudflare.",
      "Supported service continuity and technical troubleshooting for live digital delivery.",
      "Participated in Ruta de Emprendimiento 2024, a startup acceleration program focused on product and business model refinement.",
    ],
    currentJob: true,
  },
  {
    title: "Frontend Developer",
    startDate: "2023-12-10",
    endDate: "2024-02-10",
    company: "TBS Wireless Services S.A.S.",
    location: "Remote | Bogotá, CO",
    description:
      "Implemented modern web experiences for a technology services company.",
    goals: [
      "Built a responsive landing page using React, Next.js, and Tailwind CSS, ensuring cross-device consistency.",
      "Collaborated with designers to align brand identity with frontend implementation.",
      "Improved responsiveness and frontend performance across all target devices.",
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
      "Delivered full-stack and frontend solutions for startups, SMEs, and organizations across payments, retail, media, and pet services.",
    goals: [
      "Built Octopay landing page with Next.js 15, React 19, and Framer Motion for a digital payments platform.",
      "Developed Tienda Patitas — landing, backend, and POS dashboard — as a coordinated monorepo for a pet products retailer.",
      "Built Santo Código landing page with React and Vite, focused on fast delivery and mobile-first design.",
      "Delivered responsive web presences for Negocios Uno, Iwie Agro, Fundación Embajadores Comunitarios, and others.",
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
