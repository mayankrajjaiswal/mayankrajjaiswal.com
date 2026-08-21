export interface Certification {
  id: string;
  name: string;
  issuer: string;
  isFuture?: boolean;
}

export const certifications: Certification[] = [
  { id: "aws-architect", name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services" },
  { id: "aws-developer", name: "AWS Certified Developer", issuer: "Amazon Web Services" },
  { id: "aws-cloud", name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
  { id: "aws-ai", name: "AWS Certified AI Practitioner", issuer: "Amazon Web Services" },
  { id: "iitk-cyber", name: "Advanced Cybersecurity Program", issuer: "IIT Kanpur" },
  { id: "iitk-award", name: "Exceptional Performance Award", issuer: "IIT Kanpur" },
  { id: "mtech-bits", name: "M.Tech – Software Engineering", issuer: "BITS Pilani" },
  { id: "phd-ai", name: "Ph.D – Artificial Intelligence for Cybersecurity", issuer: "In Progress", isFuture: true }
];
