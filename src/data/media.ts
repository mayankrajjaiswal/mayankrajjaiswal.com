export interface MediaAppearance {
  id: string;
  outlet: string;
  title: string;
  type: 'Television' | 'Press' | 'Video' | 'Publication';
  description: string;
  url?: string;
  /** Only include a date when it is independently verifiable from the source. */
  date?: string;
}

/**
 * Real, independently verifiable media appearances only. Every entry with a
 * `url` should resolve to actual coverage -- link checking here matters more
 * than most other sections, since these are the strongest external-authority
 * signals on the site.
 */
export const mediaAppearances: MediaAppearance[] = [
  {
    id: "zee-business-qr-fraud",
    outlet: "Zee Business",
    title: "Panel Discussion: QR Code Fraud & Public Wi-Fi Financial Safety",
    type: "Television",
    description: "Featured panelist alongside Virag Gupta and anchor Deepak Dobhal, discussing how QR-code scams work and practical steps viewers can take to avoid falling victim, including avoiding financial transactions over public Wi-Fi.",
    url: "https://youtu.be/B4UjVE2207A"
  },
  {
    id: "security-affairs-hackers-conf",
    outlet: "Security Affairs",
    title: "The Hackers Conference 2013 — Hackers Will Demonstrate Digital Dangers",
    type: "Press",
    description: "International security press coverage of The Hackers Conference, where talks on mobile and digital security risks — including Android application backdoors — were presented to a live audience.",
    url: "https://securityaffairs.co/wordpress/17138/hacking/the-hackers-conference-2013-hackers-will-demonstrate-digital-dangers.html"
  },
  {
    id: "digital-threat-report-reviewer",
    outlet: "India's First Digital Threat Report",
    title: "Technical Reviewer",
    type: "Publication",
    description: "Served as a technical reviewer for India's first Digital Threat Report, contributing subject-matter review on cybersecurity threat trends."
  }
];
