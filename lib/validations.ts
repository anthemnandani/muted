import { Privacy } from '@/generated/prisma/enums';
import { z } from 'zod';

export const FormSchema = z.object({
  bio: z.string(),
  link: z
    .string()
    .url()
    .refine((url) => {
      try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Must be a valid HTTPS url')
    .or(z.literal('')),
  privacy: z.nativeEnum(Privacy).default(Privacy.PUBLIC),
});

export const AppealFormSchema = z.object({
  reason: z
    .string()
    .min(20, {
      message: 'Please provide a detailed reason (at least 20 characters).',
    })
    .max(250, { message: 'Reason must be under 250 characters.' }),
});
