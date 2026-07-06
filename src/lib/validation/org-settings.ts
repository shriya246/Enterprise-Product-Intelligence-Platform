import { z } from "zod";

export const addMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(["admin", "member"]),
});

export const changeRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["owner", "admin", "member"]),
});

export const removeMemberSchema = z.object({
  userId: z.string().uuid(),
});
