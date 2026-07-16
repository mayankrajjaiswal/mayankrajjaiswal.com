export interface Project {
  id: string;
  title: string;
  category: string;
  status?: string;
  description: string;
  technologies?: string[];
  mission?: string;
  topics?: string[];
  future?: string;
}

export const projects: Project[] = [
  {
    id: "aboutiam",
    title: "AboutIAM",
    status: "Active",
    category: "Identity & Access Management",
    description: "AboutIAM is a long-term initiative dedicated to simplifying modern Identity & Access Management through engineering, research, education, and open collaboration. The vision is to create one of the most comprehensive learning and engineering platforms focused entirely on enterprise identity.",
    topics: ["Authentication", "Authorization", "OAuth", "OIDC", "Identity Governance", "PKI", "Passkeys", "Zero Trust", "Cloud Identity", "Developer Identity", "AI for IAM"],
    future: "Global knowledge platform."
  },
  {
    id: "thecybernews",
    title: "TheCyberNews",
    category: "Cyber Awareness",
    description: "TheCyberNews is a cybersecurity awareness initiative focused on simplifying complex security concepts and making cybersecurity knowledge accessible to students, engineers, researchers, and enterprises.",
    mission: "Increase cybersecurity awareness. Promote secure engineering. Build stronger security communities."
  },
  {
    id: "enterprise-identity",
    title: "Enterprise Identity Platform",
    category: "Enterprise Security",
    description: "Designed enterprise-scale Identity & Access Management solutions supporting secure authentication, authorization, digital onboarding, transaction signing, and enterprise identity lifecycle management.",
    technologies: ["OAuth", "OIDC", "JWT", "PKI", "HSM", "Docker", "Kubernetes", "Cloud"]
  },
  {
    id: "cloud-native-security",
    title: "Cloud Native Security",
    category: "Cloud Security",
    description: "Designed and modernized secure cloud-native platforms using containerized microservices, Kubernetes, secure communication channels, and DevSecOps pipelines."
  },
  {
    id: "secure-push",
    title: "Secure Push Platform",
    category: "Platform Architecture",
    description: "Designed secure notification platforms supporting enterprise authentication workflows using APNS, Firebase Cloud Messaging, and distributed architectures."
  },
  {
    id: "devsecops-transformation",
    title: "DevSecOps Transformation",
    category: "Engineering Leadership",
    description: "Led modernization of software delivery pipelines by migrating legacy infrastructure to GitLab CI/CD while integrating automated security scanning and quality gates."
  },
  {
    id: "health-tshirt",
    title: "Health Monitoring T-Shirt",
    category: "IoT & Embedded",
    description: "Designed and developed an intelligent wearable capable of continuously monitoring health parameters and transmitting secure data for medical analysis."
  },
  {
    id: "gps-tracking",
    title: "GPS Tracking Platform",
    category: "IoT & Logistics",
    description: "Designed firmware and hardware for one of India's earliest in-house GPS tracking solutions supporting fleet monitoring and intelligent tracking."
  },
  {
    id: "digital-signage",
    title: "Digital Signage Platform",
    category: "Cloud Infrastructure",
    description: "Designed one of the earliest cloud-managed digital signage platforms supporting centralized management of displays deployed across multiple locations."
  },
  {
    id: "iot-research",
    title: "IoT Research",
    category: "Research",
    description: "Designed multiple IoT prototypes including industrial automation, connected devices, monitoring platforms, and embedded systems."
  }
];
