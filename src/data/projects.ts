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
  /** External link to the live project, case study, or verifiable reference. */
  url?: string;
  /** Slug for an in-depth case-study route at /projects/[slug]/, if one exists. */
  caseStudySlug?: string;
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
    mission: "Increase cybersecurity awareness. Promote secure engineering. Build stronger security communities.",
    url: "https://www.thecybernews.org/"
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
    description: "Designed and developed an intelligent wearable capable of continuously monitoring health parameters and transmitting secure data for medical analysis. Built for soldiers deployed in remote and extreme-condition areas, sending health parameters back to base camp for rapid response, with a parallel application in remote patient monitoring.",
    caseStudySlug: "health-monitoring-tshirt"
  },
  {
    id: "gps-tracking",
    title: "GPS Tracking Platform",
    category: "IoT & Logistics",
    status: "Case Study",
    description: "One of India's earliest fully in-house GPS-based vehicle and asset tracking systems — PCB layout, circuit design, 3D modelling, firmware, and hardware all designed and assembled locally, end to end.",
    caseStudySlug: "gps-tracking-platform"
  },
  {
    id: "digital-signage",
    title: "Digital Signage Platform",
    category: "Cloud Infrastructure",
    status: "Case Study",
    description: "One of the world's earliest cloud-managed, Raspberry Pi-based digital signage platforms, supporting centralized management of displays deployed across multiple retail, hospitality, and institutional locations under the StarxMedia brand.",
    url: "https://www.starxmedia.in/",
    caseStudySlug: "digital-signage-platform"
  },
  {
    id: "zerotouch",
    title: "ZeroTouch Device Family",
    category: "IoT & Embedded",
    status: "Case Study",
    description: "A family of contactless hardware devices — Sanity Gate, Sanity Thermocheck, a hand sanitizer dispenser, and a zero-touch door key — conceived, designed, and manufactured in-house during the COVID-19 pandemic and deployed at hospitals, temples, and commercial sites.",
    caseStudySlug: "zerotouch-covid-devices"
  },
  {
    id: "ioc-theft-detection",
    title: "Fuel Theft Detection System",
    category: "IoT & Logistics",
    description: "Built a theft-detection system prototype for Indian Oil Corporation (IOC) to verify correct fuel volume delivery from delivery fleets at distribution centers.",
    technologies: ["Embedded Systems", "IoT Sensors", "Fleet Monitoring"]
  },
  {
    id: "railways-automation",
    title: "Indian Railways Coach Factory Automation",
    category: "Industrial Automation",
    description: "Contributed to an automation initiative for an Indian Railways coach factory, applying industrial process automation to manufacturing workflows."
  },
  {
    id: "iitk-health-automation",
    title: "IIT-K Health-Center Automation",
    category: "Healthcare IT",
    description: "Mentored the development of an automation system for IIT Kanpur's health center, digitizing patient records and clinic workflows."
  },
  {
    id: "parental-control",
    title: "Parental Control & Monitoring App",
    category: "Mobile Security",
    description: "Built a parental control application and device monitoring system deployed by a leading Indian mobile handset manufacturer."
  },
  {
    id: "zepkart",
    title: "ZepKart",
    category: "FinTech / Payments",
    description: "A payments application offering 100% shopping cashback, positioned as a local alternative to NearBuy — covering wallet top-ups, merchant payments, and a rewards passbook.",
    url: "https://www.zepkart.com/",
    technologies: ["Mobile Payments", "Wallet", "Cashback Rewards"]
  },
  {
    id: "9tomato",
    title: "9Tomato",
    category: "Startup Platform",
    description: "A platform connecting budding startups with mentorship, guidance, and early-stage funding pathways.",
    url: "https://www.9tomato.com/"
  },
  {
    id: "iot-research",
    title: "IoT Research",
    category: "Research",
    description: "Designed multiple IoT prototypes including industrial automation, connected devices, monitoring platforms, and embedded systems."
  }
];
