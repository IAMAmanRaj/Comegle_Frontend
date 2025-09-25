import { z } from "zod";

export const addCommunityToWaitListSchema = z.object({
  community_name : z
    .string()
    .min(1, "Community name cannot be empty")
    .max(30, "Community name should must be below 30 characters"),
});

export type AddCommunityToWaitListPayload = z.infer<
  typeof addCommunityToWaitListSchema
>;
