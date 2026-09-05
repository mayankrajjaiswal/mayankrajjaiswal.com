export interface SpeakingEngagement {
  id: string;
  role: string;
  event: string;
}

export const speakingEngagements: SpeakingEngagement[] = [
  { id: "hackers-conf", role: "Lead Speaker & Organizing Member", event: "TheHackersConference" },
  { id: "hackers-news", role: "Speaker", event: "TheHackerNews" },
  { id: "google-plex", role: "Speaker", event: "Google Business Group (GooglePlex)" },
  { id: "google-dev", role: "Speaker", event: "Google Developer Group (GDG)" },
  { id: "iit-kanpur", role: "Speaker", event: "IIT Kanpur" },
  { id: "lpu", role: "Speaker", event: "Lovely Professional University (LPU)" },
  { id: "parul", role: "Speaker", event: "Parul University" },
  { id: "metro", role: "Speaker", event: "Metro University" },
  { id: "gov-poly", role: "Speaker", event: "Government Polytechnic" },
  { id: "uptu", role: "Speaker", event: "UPTU Engineering Colleges" },
  { id: "bms", role: "Speaker", event: "BMS and other engineering institutions" },
  { id: "coding-gurukul", role: "Speaker", event: "Coding Gurukul" },
  { id: "many-more", role: "Speaker", event: "Many More..." }
];
