import { Privacy } from '@prisma/client';
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
