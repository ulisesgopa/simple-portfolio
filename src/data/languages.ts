interface Language {
    name: string;
    level: string;
    description: string;
    show: boolean;
}

const languages: Language[] = [
  {
    name: "English",
    level: "Intermediate",
    description: "I can hear and write fluently",
    show: true,
  },
  {
    name: "Spanish",
    level: "Native",
    description: "Spanish is my native language",
    show: true,
  },
];

export default languages;