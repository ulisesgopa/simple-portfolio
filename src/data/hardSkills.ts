interface HardSkill {
  name: string;
  description: string;
  icon: string;
}

const hardSkills: HardSkill[] = [
  {
    name: "React",
    description:
      "My go-to library for building dynamic and reactive user interfaces",
    icon: "react",
  },
  {
    name: "Tailwind CSS",
    description:
      "A utility-first framework I use to build clean, responsive designs efficiently",
    icon: "tailwind",
  },
  {
    name: "NextJs",
    description:
      "My favorite React framework for building scalable and SEO-friendly web apps",
    icon: "nextjs_icon_dark",
  },
  {
    name: "Vite",
    description:
      "My preferred build tool for fast and modern frontend development",
    icon: "vite",
  },
];

export default hardSkills;