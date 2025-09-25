import { z } from "zod";

export const saveEditUserProfileSchema = z.object({
  full_name: z
    .string()
    .min(3, "Full name must be at least 3 characters long")
    .max(30, "Full name must be at most 30 characters long")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username must contain only letters, numbers, or underscores",
    })
    .optional(),
  avatar_url: z.url("Invalid avatar URL").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  country: z.string().max(50, "Country name too long").optional(),
  bio: z
    .string()
    .max(200, "Bio must be at most 200 characters long")
    .optional(),
  tags: z.array(z.string().min(1)).max(10, "Max 10 tags allowed").optional(),
  socials: z
    .object({
      linked_in: z.url("Invalid LinkedIn URL").or(z.literal("")).optional(),
      twitter: z.url("Invalid Twitter URL").or(z.literal("")).optional(),
      instagram: z.url("Invalid Instagram URL").or(z.literal("")).optional(),
    })
    .optional(),
});

export type SaveEditUserProfilePayload = z.infer<
  typeof saveEditUserProfileSchema
>;
