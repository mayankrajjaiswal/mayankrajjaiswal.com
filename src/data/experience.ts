export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  overview: string;
  contributions: string[];
  impact: string[];
  products?: string[];
}

export const experiences: Experience[] = [
  {
    id: "thales",
    company: "Thales Group",
    role: "Senior Technical Lead – Cybersecurity",
    duration: "2017 – Present",
    overview: "At Thales, Mayank has been responsible for designing and leading enterprise-grade cybersecurity solutions used by financial institutions and enterprises worldwide. His work spans Identity & Access Management (IAM), enterprise authentication, cryptographic infrastructure, secure digital identity, cloud-native security platforms, DevSecOps, and secure software architecture. Instead of simply building software, his role focuses on designing secure platforms that protect digital identities, transactions, and critical enterprise infrastructure.",
    contributions: [
      "Enterprise Identity Platforms",
      "Authentication & Authorization",
      "Identity Lifecycle",
      "OAuth 2.0 & OpenID Connect",
      "JWT",
      "PKI & Certificate Lifecycle",
      "HSM Integration (PKCS#11)",
      "Cloud Security",
      "Kubernetes & Docker",
      "GitLab CI/CD & DevSecOps",
      "Secure SDLC",
      "Threat Modeling",
      "Cyber Resilience",
      "Architecture Reviews",
      "Technical Leadership",
      "Product Strategy",
      "Customer Onboarding",
      "Global Banking Solutions"
    ],
    impact: [
      "Designed enterprise-grade identity platforms serving global customers.",
      "Architected secure authentication frameworks for enterprise deployments.",
      "Integrated Hardware Security Modules (HSMs) for secure cryptographic operations.",
      "Led migration towards modern DevSecOps practices.",
      "Improved software delivery pipelines.",
      "Reduced infrastructure complexity.",
      "Enabled cloud-native deployments.",
      "Supported global financial organizations.",
      "Led architecture discussions across multiple teams.",
      "Mentored engineers.",
      "Participated in product roadmap planning.",
      "Contributed to Cyber Resilience Act readiness."
    ],
    products: [
      "Enrollment & Provisioning Server (EPS)",
      "Mobile Secure Messenger (MSM)",
      "SPA",
      "IdCloud",
      "Enterprise Identity Platform"
    ]
  },
  {
    id: "samsung",
    company: "Samsung Research",
    role: "Technical Lead",
    duration: "2011 – 2017",
    overview: "At Samsung Research, Mayank worked across multiple large-scale consumer and enterprise products covering Android, Mobile Device Management (MDM), Samsung Knox, Samsung Pay, Browser technologies, Firmware Over-The-Air (FOTA), automation platforms, and cloud infrastructure. This phase of his career established strong foundations in software engineering, distributed systems, security, Android internals, mobile platforms, and product development.",
    contributions: [
      "Samsung Knox",
      "Samsung Pay",
      "Android",
      "MDM",
      "Enterprise Mobility",
      "Binary Distribution",
      "Deployment Automation",
      "Firmware Platforms",
      "Browser",
      "Android Framework",
      "Cloud Services",
      "Security",
      "Automation",
      "Continuous Integration",
      "Performance Optimization"
    ],
    impact: [
      "Delivered multiple enterprise and consumer products.",
      "Built scalable deployment platforms.",
      "Improved automation across engineering teams.",
      "Contributed to mobile security initiatives.",
      "Worked on secure enterprise mobility.",
      "Optimized software delivery.",
      "Led engineering initiatives.",
      "Mentored junior engineers."
    ]
  }
];
