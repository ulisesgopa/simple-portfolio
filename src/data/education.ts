interface Education {
    title: string;
    startDate: string;
    endDate?: string;
    school: string;
    location: string;
    description: string;
    currentUni: boolean;
}

const education: Education[] = [
  {
    title: "Frontend Developer",
    startDate: "2022-09-01",
    endDate: "2023-09-01",
    school: "Platzi Web Development School",
    location: "Remote",
    description:
      "Certifications in Frontend Development and Programming Fundamentals. Relevant Coursework: HTML, CSS, JavaScript, Git & GitHub, Mobile First Design, Algorithms.",
    currentUni: false,
  },
  {
    title: "English for Beginners & Intermediate",
    startDate: "2022-01-02",
    endDate: "2022-06-02",
    school: "Platzi English Academy",
    location: "United States",
    description:
      "Built essential English skills to better communicate in global tech environments.",
    currentUni: false,
  },
];

export default education;