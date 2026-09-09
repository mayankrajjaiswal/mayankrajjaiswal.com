export const researchTopics = [
  "Identity & Access Management",
  "OAuth 2.0",
  "OpenID Connect",
  "PKI",
  "Certificate Lifecycle",
  "Hardware Security Modules",
  "Zero Trust",
  "Threat Modeling",
  "Cloud Security",
  "DevSecOps",
  "Secure SDLC",
  "AI Security",
  "Post Quantum Cryptography",
  "Secure Enterprise Architecture",
  "Cyber Resilience",
  "Digital Identity"
];

export const futureResearch = [
  "AI Agents for Cybersecurity",
  "Enterprise AI Security",
  "Identity Intelligence",
  "Adaptive Authentication",
  "Risk-based Access Control"
];

export interface Publication {
  id: string;
  title: string;
  type: string;
  description: string;
  publisher?: string;
  year?: string;
  url?: string;
}

export const publications: Publication[] = [
  {
    id: "cyber-book",
    title: "Implementing Enterprise Cybersecurity with Open-Source Software and Standard Architecture",
    type: "Book",
    description: "A River Publishers title, published in association with IIT Kanpur, covering open-source enterprise cybersecurity implementation and standard reference architecture. Edited by Anand Handa, Rohit Negi, and Sandeep K. Shukla.",
    publisher: "River Publishers",
    year: "2020",
    url: "https://www.riverpublishers.com/book_details.php?book_id=950"
  },
  {
    id: "ieee-papers",
    title: "IEEE Publications",
    type: "Research Paper",
    description: "Published research papers detailing advancements in IoT security, embedded systems, and communication protocols.",
    publisher: "IEEE",
    url: "https://ieeexplore.ieee.org/document/9514776"
  },
  {
    id: "whitepapers",
    title: "Enterprise IAM Architecture",
    type: "Whitepaper",
    description: "Technical whitepapers covering best practices for large-scale Identity and Access Management deployments."
  }
];
