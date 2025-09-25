import { z } from "zod";

export const userOnboardingSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(30, "Full name must be at most 30 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username must contain only letters, numbers, or underscores",
    }),
  avatar_url: z.url("Invalid avatar URL"),
  email: z.email("Invalid email address"),
  college_id: z.uuid("Invalid collegeId"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Gender must be Male, Female, or Other",
  }),
  age: z.int().min(16, "Minimum age is 16").max(100, "Maximum age is 100"),
});

export type userOnboardingPayload = z.infer<typeof userOnboardingSchema>;
