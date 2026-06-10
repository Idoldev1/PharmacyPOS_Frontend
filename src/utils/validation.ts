import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(4, "Password is required"),
});

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().regex(/^(\+234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number"),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
});

export const drugSearchSchema = z.object({
  query: z.string().min(2, "Enter at least 2 characters"),
});
