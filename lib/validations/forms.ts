import { z } from "zod";

export const ValidationErrors = {
  NAME_MIN: "name_min",
  NAME_MAX: "name_max",
  EMAIL_INVALID: "email_invalid",
  EMAIL_MAX: "email_max",
  SUBJECT_MIN: "subject_min",
  SUBJECT_MAX: "subject_max",
  MESSAGE_MIN: "message_min",
  MESSAGE_MAX: "message_max",
  COMMENT_MIN: "comment_min",
  COMMENT_MAX: "comment_max",
  POST_ID_INVALID: "post_id_invalid",
} as const;

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, ValidationErrors.NAME_MIN)
    .max(100, ValidationErrors.NAME_MAX)
    .trim(),
  email: z
    .string()
    .email(ValidationErrors.EMAIL_INVALID)
    .max(255, ValidationErrors.EMAIL_MAX)
    .trim()
    .toLowerCase(),
  subject: z
    .string()
    .min(3, ValidationErrors.SUBJECT_MIN)
    .max(200, ValidationErrors.SUBJECT_MAX)
    .trim(),
  message: z
    .string()
    .min(10, ValidationErrors.MESSAGE_MIN)
    .max(5000, ValidationErrors.MESSAGE_MAX)
    .trim(),
});

export const commentFormSchema = z.object({
  author_name: z
    .string()
    .min(2, ValidationErrors.NAME_MIN)
    .max(100, ValidationErrors.NAME_MAX)
    .trim(),
  author_email: z
    .string()
    .email(ValidationErrors.EMAIL_INVALID)
    .max(255, ValidationErrors.EMAIL_MAX)
    .trim()
    .toLowerCase(),
  content: z
    .string()
    .min(3, ValidationErrors.COMMENT_MIN)
    .max(2000, ValidationErrors.COMMENT_MAX)
    .trim(),
  post_id: z.string().uuid(ValidationErrors.POST_ID_INVALID),
  parent_id: z.string().uuid(ValidationErrors.POST_ID_INVALID).nullable().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type CommentFormData = z.infer<typeof commentFormSchema>;
