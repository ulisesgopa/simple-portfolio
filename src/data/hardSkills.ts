interface HardSkill {
  name: string;
  description: string;
  icon: string;
}

const hardSkills: HardSkill[] = [
  {
    name: "Git",
    description:
      "A version control system I use to manage code changes and collaborate with others",
    icon: "git",
  },
  {
    name: "Github",
    description:
      "My preferred platform for hosting and sharing code repositories",
    icon: "github",
  },
  {
    name: "Javascript",
    description:
      "My primary programming language for building interactive web applications",
    icon: "javascript",
  },
  {
    name: "React",
    description:
      "My go-to library for building dynamic and reactive user interfaces",
    icon: "react",
  },
  {
    name: "NextJs",
    description:
      "My favorite React framework for building scalable and SEO-friendly web apps",
    icon: "nextjs_icon_dark",
  },
  {
    name: "Tailwind CSS",
    description:
      "A utility-first framework I use to build clean, responsive designs efficiently",
    icon: "tailwind",
  },
];

export default hardSkills;