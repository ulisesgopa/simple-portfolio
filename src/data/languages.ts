interface Language {
    name: string;
    level: string;
    description: string;
    show: boolean;
}

const languages: Language[] = [
  {
    name: "Spanish",
    level: "Native",
    description: "Spanish is my native language",
    show: true,
  },
  {
    name: "English",
    level: "Intermediate",
    description: "Reading, writing, and professional communication in tech environments",
    show: true,
  },
];

export default languages;