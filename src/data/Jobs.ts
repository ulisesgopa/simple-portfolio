/**
 * Interface representing work experience details.
 *
 * @property {string} title - The job title of the position.
 * @property {string} startDate - The start date of the position in the format YYYY-MM-DD.
 * @property {string} [endDate] - The end date of the position in the format YYYY-MM-DD.
 *                                Optional, can be omitted if the position is current.
 * @property {string} company - The name of the company where the position was held.
 * @property {string} location - The geographic location of the company (e.g., city, state, country).
 * @property {string} description - A brief description of the roles and responsibilities
 *                                   associated with the position.
 * @property {string[]} goals - A list of professional goals achieved or targeted during the position.
 * @property {boolean} currentJob - Indicates whether the position is the current job.
 */
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

/**
 * Represents an array of work experiences.
 *
 * Each work experience object contains details about
 * a job position including the title, start and end dates,
 * company name, job location, description of the role,
 * a list of goals or achievements, and a flag indicating
 * if it is the current job.
 *
 * @type {Array<Object>}
 * @property {string} title - The job title.
 * @property {string} startDate - The start date of the job in YYYY-MM-DD format.
 * @property {string} [endDate] - The end date of the job in YYYY-MM-DD format. Optional for current jobs.
 * @property {string} company - The name of the company.
 * @property {string} location - The location of the job.
 * @property {string} description - A brief description of the job responsibilities.
 * @property {Array<string>} goals - A list of goals or achievements within the job.
 * @property {boolean} currentJob - A flag indicating if the job is the current one.
 */
const workExperience: WorkExperience[] = [
  {
    title: "Founder & CEO",
    startDate: "2024-02-14",
    company: "Stream Tech S.A.S.",
    location: "Bogotá & Medellín, CO",
    description:
      "Stream Tech S.A.S. is a company that provides technology solutions to the Colombian market.",
    goals: [
      "Started Stream Tech to simplify how media organizations manage livestreams and virtual events through smart automation and user-friendly tools.",
      "Participated in Ruta de Emprendimiento 2024, a startup program that helped refine our product and business model with the support of mentors and peers.",
    ],
    currentJob: true,
  },
  {
    title: "Frontend Developer",
    startDate: "2023-12-10",
    endDate: "2024-02-10",
    company: "TBS Wireless Services S.A.S.",
    location: "Bogotá, CO",
    description:
      "TBS Wireless Services S.A.S. is a company that provides technology solutions to the Colombian market.",
    goals: [
      "Created a modern, responsive landing page using React, Next JS, and Tailwind CSS, ensuring smooth user experience across devices.",
      "Collaborated with designers to align brand and design requirements.",
    ],
    currentJob: false,
  },
  {
    title: "Frontend Developer",
    startDate: "2023-01-10",
    endDate: "2023-12-10",
    company: "Freelance Projects",
    location: "Bogotá, CO",
    description:
      "Freelance projects for various clients, focusing on web development and design.",
    goals: [
      "Delivered custom-built web platforms for clients like Negocios Uno, Iwie Drones, Fundación Embajadores Comunitarios.",
      "Built user-centric interfaces and ensured responsive performance across devices",
    ],
    currentJob: false,
  },
];
export default workExperience;