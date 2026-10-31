// Operational settings. Recruitment status will move to the database once the backend is connected.
export const studio = {
  name: "APCOER Startup Studio",
  collegeName: "Anantrao Pawar College of Engineering & Research",
  collegeAbbreviation: "APCOER",
  makerName: "Omkar Kavale",
  contactEmail: "omkarkavale888@gmail.com",
  location: "Pune, Maharashtra",
  cohortSize: "3–5",
  recruitmentOpen: true,
  uploads: {
    resume: { maxMB: 5, accept: ["application/pdf"], label: "PDF" },
    evidence: { maxMB: 10, accept: ["application/pdf", "image/png", "image/jpeg", "image/webp"], label: "PDF, PNG, JPG, WEBP" },
    collegeId: { maxMB: 5, accept: ["application/pdf", "image/png", "image/jpeg", "image/webp"], label: "PDF, PNG, JPG, WEBP" },
  },
} as const;

export const ROLES = [
  { id: "developer", label: "Developer / Programmer" },
  { id: "designer", label: "UI/UX Designer" },
  { id: "content", label: "Content Creator / Social Media Manager" },
] as const;

export type RoleId = (typeof ROLES)[number]["id"];
