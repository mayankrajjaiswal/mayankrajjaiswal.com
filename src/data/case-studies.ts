export interface CaseStudy {
  slug: string;
  title: string;
  category: string;
  /** One-sentence summary shown on the project card and in meta description. */
  summary: string;
  year: string;
  /** The problem being solved, in the subject's own domain context. */
  problem: string;
  /** Constraints that shaped the solution (time, budget, regulatory, physical). */
  constraints: string[];
  /** How the problem was approached — architecture, process, or method. */
  approach: string[];
  /** What was actually delivered/shipped. */
  outcome: string[];
  technologies: string[];
  /** External link to the live project or brand site, if one exists. */
  url?: string;
}

/**
 * Real case studies behind the one-line project cards on the homepage.
 * Sourced from the subject's own PhD-application profile document and résumé;
 * kept at the level of detail those documents provide, no invented specifics.
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: "gps-tracking-platform",
    title: "India's First In-House GPS Vehicle & Asset Tracker",
    category: "IoT & Logistics",
    summary: "A GPS-based vehicle and asset tracking system built end-to-end in-house — PCB, firmware, and hardware — under the COP911 brand.",
    year: "Early-career hardware venture",
    problem: "Fleet operators and asset owners in India had few affordable, locally-built options for real-time GPS tracking; most available hardware was imported and difficult to customize or service locally.",
    constraints: [
      "No existing local supply chain for a purpose-built tracking PCB — every layer had to be designed from scratch.",
      "Cost pressure to keep the bill of materials competitive against imported trackers.",
      "Small team covering hardware, firmware, and enclosure design simultaneously."
    ],
    approach: [
      "Designed the PCB layout and circuit schematic in-house, including power management and GSM/GPS module integration.",
      "Wrote the embedded firmware controlling location polling, data buffering, and transmission.",
      "3D-modelled and prototyped the enclosure for vehicle and asset mounting.",
      "Assembled and tested complete units locally rather than outsourcing manufacturing."
    ],
    outcome: [
      "Shipped a fully functional, India-built GPS tracking device under the COP911 brand.",
      "Demonstrated a complete hardware-to-firmware product cycle without external hardware vendors.",
      "Established a repeatable in-house hardware design process later reused for the ZeroTouch device family."
    ],
    technologies: ["Embedded C", "GSM/GPRS Modules", "GPS Modules", "PCB Design", "3D Modelling", "Fleet Telemetry"]
  },
  {
    slug: "digital-signage-platform",
    title: "Cloud-Managed Digital Signage — StarxMedia",
    category: "Cloud Infrastructure",
    summary: "A Raspberry Pi-based, centrally-managed digital signage platform giving small vendors an affordable alternative to print advertising.",
    year: "Early-career hardware venture",
    problem: "Small and mid-sized vendors — restaurants, salons, event venues — had no affordable way to run dynamic promotional displays; commercial digital-signage platforms were priced for large retail chains.",
    constraints: [
      "Hardware cost had to stay low enough for small-vendor adoption, ruling out commercial signage players.",
      "Displays needed centralized, remote content management across physically dispersed sites.",
      "Reliability requirements: unattended devices in retail environments with intermittent connectivity."
    ],
    approach: [
      "Built the player hardware around Raspberry Pi, including custom firmware for content playback and remote updates.",
      "Designed a cloud backend for centralized content push, scheduling, and device monitoring across all deployed units.",
      "3D-modelled mounting and enclosure hardware suitable for retail and hospitality installation.",
      "Delivered the full stack — hardware, firmware, and cloud management — as the StarxMedia product line."
    ],
    outcome: [
      "Deployed to real vendor sites including D S Group, Cygnet Hospital, ISKCON, and Ekta Footwear.",
      "Gave small vendors centrally-managed promotional displays at a fraction of commercial signage cost.",
      "Validated as one of the earliest cloud-managed, Raspberry Pi-based signage platforms built in India."
    ],
    technologies: ["Raspberry Pi", "Embedded Linux", "Cloud Device Management", "3D Modelling", "Remote Content Delivery"],
    url: "https://www.starxmedia.in/"
  },
  {
    slug: "zerotouch-covid-devices",
    title: "ZeroTouch — Contactless Hardware for COVID-19",
    category: "IoT & Embedded",
    summary: "A family of contactless devices — sanitizing gates, thermal-check stands, and zero-touch keys — designed and manufactured in-house during the pandemic.",
    year: "2020",
    problem: "During the COVID-19 pandemic, public and commercial spaces needed low-cost contactless screening and sanitization infrastructure faster than existing supply chains could deliver it.",
    constraints: [
      "Extreme time pressure — designs had to move from concept to deployable hardware in a compressed pandemic timeline.",
      "Supply-chain disruption during lockdowns limited access to standard components.",
      "Devices had to be safe, reliable, and usable by non-technical staff at hospitals, temples, and retail sites with no training."
    ],
    approach: [
      "Designed and built a product family: a walk-through sanitizing tunnel (\"Sanity Gate\"), a foot-operated sanitizer stand, a wall-mounted thermal-check unit (\"Sanity Thermocheck\"), a touch-free hand-sanitizer dispenser, and a zero-touch door key.",
      "Handled the full in-house cycle — PCB design, firmware, mechanical enclosure, and assembly — at the team's own lab and production site.",
      "Iterated quickly against real deployment feedback from installed sites rather than a long design cycle."
    ],
    outcome: [
      "Deployed at Cygnet Multispeciality Hospital, ISKCON, D S Group facilities, and Ekta Footwear, among others.",
      "Delivered a complete contactless-hardware product line during an active public health emergency.",
      "Demonstrated rapid, in-house hardware innovation under real supply-chain and time constraints."
    ],
    technologies: ["Embedded Systems", "PCB Design", "Mechanical Enclosure Design", "Rapid Prototyping", "IR Thermal Sensing"]
  },
  {
    slug: "health-monitoring-tshirt",
    title: "Health Monitoring T-Shirt for Remote Deployment",
    category: "IoT & Embedded",
    summary: "A connected wearable transmitting health parameters from soldiers in remote deployment to base camp, with a parallel remote-patient-monitoring use case.",
    year: "Early-career hardware venture",
    problem: "Soldiers deployed in remote or extreme-condition areas had no way for base camp to remotely monitor their health status, delaying emergency response when it mattered most.",
    constraints: [
      "The sensing hardware had to be wearable and durable enough for extreme field conditions.",
      "Data transmission needed to work reliably from remote locations with limited connectivity.",
      "The same design needed to generalize to a second, very different use case — remote civilian patient monitoring."
    ],
    approach: [
      "Designed a wearable garment embedding health-parameter sensors with a connected transmission module.",
      "Built the data pipeline to relay vital signs to a base-camp monitoring point for rapid action on anomalies.",
      "Adapted the same sensing and transmission design for medical-care patients who could wear the garment for remote monitoring."
    ],
    outcome: [
      "Delivered a working wearable prototype demonstrating continuous, remote health-parameter monitoring.",
      "Identified a defence use case (soldiers in extreme conditions) and a civilian use case (remote patient monitoring) from one design.",
    ],
    technologies: ["Wearable Sensors", "Embedded Systems", "Remote Telemetry", "Biometric Monitoring"]
  }
];
