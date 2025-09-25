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
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
    message: "Gender must be one of the allowed values",
  }),
  dob: z
    .preprocess((val) => {
      if (typeof val === "string" || val instanceof Date) return new Date(val);
    }, z.date())
    .refine(
      (date) => {
        const today = new Date();
        const age =
          today.getFullYear() -
          date.getFullYear() -
          (today <
          new Date(today.getFullYear(), date.getMonth(), date.getDate())
            ? 1
            : 0);
        return age >= 16 && age <= 100;
      },
      { message: "Age must be between 16 and 100" }
    ),
});

export type userOnboardingPayload = z.infer<typeof userOnboardingSchema>;
