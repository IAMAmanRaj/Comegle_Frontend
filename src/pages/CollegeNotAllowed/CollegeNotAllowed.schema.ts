import { z } from "zod";

// List of common general email domains (expand as needed)
const generalEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "protonmail.com",
  "icloud.com",
];

export const collegeNotAllowedSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(30, "Full name must be at most 30 characters"),

  college_email: z
    .email("Invalid email address")
    .refine(
      (val) => {
        const domain = val.split("@")[1]?.toLowerCase();
        return domain && !generalEmailDomains.includes(domain);
      },
      {
        message:
          "Please use your organizational (college/university) email address",
      }
    ),

  college_name: z
    .string()
    .min(3, "College name must be at least 3 characters")
    .max(100, "College name must be at most 100 characters"),
});

export type collegeNotAllowedPayload = z.infer<typeof collegeNotAllowedSchema>;
