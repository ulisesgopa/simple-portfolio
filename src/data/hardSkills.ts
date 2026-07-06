interface HardSkill {
  name: string;
  description: string;
  icon: string;
}

const hardSkills: HardSkill[] = [
  {
    name: "JavaScript ES6+",
    description:
      "My primary language, async/await, destructuring, modules, and modern DOM patterns",
    icon: "javascript",
  },
  {
    name: "React",
    description:
      "Component architecture, hooks (useState, useEffect, useRef), and React patterns for dynamic UIs",
    icon: "react",
  },
  {
    name: "Next.js",
    description:
      "My favorite React framework for scalable, SEO friendly web applications",
    icon: "nextjs_icon_dark",
  },
  {
    name: "TypeScript",
    description:
      "Type safe development, interfaces, generics, and Zod schema validation",
    icon: "typescript",
  },
  {
    name: "Tailwind CSS",
    description:
      "Utility first styling, responsive design systems, and custom theme configuration",
    icon: "tailwind",
  },
  {
    name: "Vite",
    description:
      "Fast build tooling for modern frontend projects and local development",
    icon: "vite",
  },
  {
    name: "Astro",
    description:
      "Static site generation with island architecture, this portfolio is built with it",
    icon: "astro_dark",
  },
  {
    name: "Git & GitHub",
    description:
      "Version control, feature branches, pull requests, and collaborative workflows",
    icon: "git",
  },
  {
    name: "React Native & Expo",
    description:
      "Cross platform mobile apps for iOS and Android from a single TypeScript codebase, with file-based routing via Expo Router",
    icon: "expo",
  },
  {
    name: "Node.js & Bun",
    description:
      "Backend runtimes for REST APIs Bun for high performance services (Tienda Patitas, POS Colombia), Node.js for serverless functions",
    icon: "nodejs",
  },
];

export default hardSkills;
