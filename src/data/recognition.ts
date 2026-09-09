export interface Recognition {
  id: string;
  title: string;
  organization: string;
  description: string;
  isFuture?: boolean;
}

/**
 * Advisory roles, internal recognitions, and community contributions that do
 * not fit the Certifications (formal credentials) or Speaking (engagements)
 * sections. Kept at the level of abstraction the subject's own résumé uses --
 * no operational detail on advisory work for defence-adjacent organizations.
 */
export const recognitions: Recognition[] = [
  {
    id: "iaf-security-advisor",
    title: "Security Advisor (Advisory Engagement)",
    organization: "Indian Air Force",
    description: "Advised officials on security measures to reduce the risk of surveillance and information leakage affecting premises and personnel."
  },
  {
    id: "thales-security-champion",
    title: "Security Champion",
    organization: "Thales Group",
    description: "Recognized internally as a Security Champion, a role focused on embedding secure-by-design practices across engineering teams."
  },
  {
    id: "iam-ai-core-member",
    title: "Core Member, IAM AI Initiatives",
    organization: "Thales Group",
    description: "Core contributor to internal initiatives applying AI (including Gemini) to identity and access management security automation."
  },
  {
    id: "samsung-advanced-competency",
    title: "Advanced Competency Level — Top 7% Organization-Wide",
    organization: "Samsung R&D",
    description: "Recognized at the Advanced Competency Level, placing in the top 7% of engineers organization-wide."
  },
  {
    id: "brics-iitk-training",
    title: "Training Hardware Contributor, BRiCS",
    organization: "IIT Kanpur",
    description: "Helped BRiCS (IIT Kanpur) create interactive, easy-to-integrate training hardware for undergraduate students, and mentored students nationally through the IIT Kanpur SIDBI program."
  },
  {
    id: "patent-contributor",
    title: "Patent Contributor",
    organization: "Samsung Research",
    description: "Contributed patentable ideas during tenure at Samsung Research; several were implemented as internal tools or shipped mobile device features."
  },
  {
    id: "ngo-education",
    title: "NGO Education Contributor",
    organization: "Community Initiative",
    description: "Associated with NGO efforts supporting education for underprivileged children."
  }
];
