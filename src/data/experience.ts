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
    overview: "At Thales, Mayank has been responsible for designing and leading enterprise-grade cybersecurity solutions used by financial institutions and enterprises worldwide. His work spans Identity & Access Management (IAM), enterprise authentication, FIPS-compliant cryptographic infrastructure, secure digital identity, cloud-native security platforms, DevSecOps, and secure software architecture. Instead of simply building software, his role focuses on designing secure platforms that protect digital identities, transactions, and critical enterprise infrastructure in compliance with PCI-DSS and PSD2/PSD3 frameworks.",
    contributions: [
      "Enterprise Identity Platforms",
      "Authentication & Authorization",
      "Identity Lifecycle Management",
      "OAuth 2.0 & OpenID Connect",
      "JSON Web Tokens (JWT)",
      "PKI & Certificate Lifecycle",
      "HSM Integration (PKCS#11)",
      "FIPS 140-2 & FIPS 140-3 Cryptographic Standards",
      "PCI-DSS Compliance Alignment",
      "PSD2 & PSD3 Open Banking Security",
      "Cloud-Native Security",
      "Kubernetes & Docker Security",
      "GitLab CI/CD & DevSecOps",
      "Secure SDLC & SAST/DAST",
      "Threat Modeling & OWASP Top 10",
      "Cyber Resilience Act Readiness",
      "Architecture Reviews",
      "Technical Leadership",
      "Product Strategy",
      "Global Banking Solutions"
    ],
    impact: [
      "Designed enterprise-grade identity platforms serving millions of global customers.",
      "Architected secure, high-integrity authentication frameworks for complex enterprise deployments.",
      "Integrated Hardware Security Modules (HSMs) in compliance with FIPS 140-2 standards to secure root keys.",
      "Aligned transactional and authentication platform security with PCI-DSS and PSD2 compliance criteria.",
      "Led the migration of global banking and identity deployment suites toward modern DevSecOps pipelines.",
      "Improved secure software delivery pipelines by integrating automated security gate scanners.",
      "Reduced infrastructure and deployment complexity across cloud-native environments.",
      "Enabled containerized cloud-native deployments of high-availability security engines.",
      "Led technical architecture discussions and alignment across multi-national engineering teams.",
      "Mentored senior engineers and planned critical product roadmap security requirements.",
      "Contributed to early readiness preparations for the European Union's Cyber Resilience Act."
    ],
    products: [
      "Enrollment & Provisioning Server (EPS)",
      "Mobile Secure Messenger (MSM)",
      "Secure Provisioning Authority (SPA)",
      "IdCloud",
      "Enterprise Identity Platform"
    ]
  },
  {
    id: "samsung",
    company: "Samsung Research",
    role: "Technical Lead",
    duration: "2011 – 2017",
    overview: "At Samsung Research, Mayank worked across multiple large-scale consumer and enterprise products covering Android framework security, Mobile Device Management (MDM), Samsung Knox hardware-backed cryptography, Samsung Pay transaction flows, Firmware Over-The-Air (FOTA) distribution, and automated cloud infrastructure. This phase established strong, hardware-backed foundations in secure operating systems, payment tokenization, and distributed enterprise platforms.",
    contributions: [
      "Samsung Knox Security",
      "Samsung Pay Security",
      "EMVCo Tokenization Standards",
      "Samsung Knox Hardware-Backed Cryptography",
      "Android Framework Security",
      "Mobile Device Management (MDM)",
      "Enterprise Mobility Management (EMM)",
      "Secure Binary Distribution",
      "Deployment Automation",
      "Secure Firmware Platforms",
      "Web Browser Engine Security",
      "Cloud Infrastructure Services",
      "Automated Testing Platforms",
      "Continuous Integration & Delivery",
      "Performance Optimization"
    ],
    impact: [
      "Delivered security architecture reviews and patches for multiple mass-market enterprise and consumer products.",
      "Integrated EMVCo payment tokenization standards to secure mobile transaction pipelines for Samsung Pay.",
      "Implemented hardware-backed key protection solutions within Samsung Knox secure enclaves.",
      "Built scalable automated deployment and verification platforms for global mobile OS distributions.",
      "Optimized continuous integration systems, reducing compile and security scanning wait-times.",
      "Led cross-team mobile security task forces to analyze and mitigate Android kernel-level vulnerabilities.",
      "Mentored junior engineers and designed internal secure coding guides for Android development."
    ]
  }
];
