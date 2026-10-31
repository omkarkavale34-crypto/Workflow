import { z } from "zod";
import { ROLES } from "@/config/studio";

const roleIds = ROLES.map((r) => r.id) as [string, ...string[]];
const req = (max: number, min = 1) => z.string().trim().min(min, "Required").max(max, `Max ${max} characters`);
const optUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => !v || /^https?:\/\/\S+\.\S+/.test(v), "Enter a full URL starting with https://");

export const stepSchemas = [
  z.object({
    fullName: req(100, 2),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    branch: req(100),
    year: z.enum(["1", "2", "3", "4", "5"], { errorMap: () => ({ message: "Select your year" }) }),
  }),
  z
    .object({
      primaryRole: z.enum(roleIds, { errorMap: () => ({ message: "Choose a primary role" }) }),
      secondaryRole: z.string(),
      skills: req(500, 3),
      roleAssessment: req(1500, 50).refine(Boolean),
    })
    .refine((d) => d.secondaryRole !== d.primaryRole, { path: ["secondaryRole"], message: "Must differ from primary role" }),
  z.object({
    projectTitle: z.string().trim().max(150),
    projectDescription: z.string().trim().max(2000),
    portfolioUrl: optUrl,
    github: optUrl,
    behance: optUrl,
    website: optUrl,
    linkedin: optUrl,
  }),
  z.object({
    whyJoin: req(1500, 80),
    wantToBuild: req(1500, 40),
    problemSolving: req(2000, 80),
    availability: req(300, 5),
  }),
];

// Full server-side schema. Previous work / portfolio fields stay optional.
export const applicationSchema = z
  .object({
    fullName: req(100, 2),
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    branch: req(100),
    year: z.enum(["1", "2", "3", "4", "5"]),
    primaryRole: z.enum(roleIds),
    secondaryRole: z.string().max(50),
    skills: req(500, 3),
    roleAssessment: req(1500, 50),
    projectTitle: z.string().trim().max(150),
    projectDescription: z.string().trim().max(2000),
    portfolioUrl: optUrl,
    github: optUrl,
    behance: optUrl,
    website: optUrl,
    linkedin: optUrl,
    whyJoin: req(1500, 80),
    wantToBuild: req(1500, 40),
    problemSolving: req(2000, 80),
    availability: req(300, 5),
  })
  .refine((d) => !d.secondaryRole || d.secondaryRole !== d.primaryRole, {
    path: ["secondaryRole"],
    message: "Must differ from primary role",
  });

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const TEXT_FIELDS = [
  "fullName", "email", "phone", "branch", "year",
  "primaryRole", "secondaryRole", "skills", "roleAssessment",
  "projectTitle", "projectDescription", "portfolioUrl", "github", "behance", "website", "linkedin",
  "whyJoin", "wantToBuild", "problemSolving", "availability",
] as const;
