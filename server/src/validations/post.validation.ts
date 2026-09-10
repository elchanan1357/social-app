import { z } from 'zod';

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const urlSchema = z.string().refine(isValidUrl, {
  message: 'Invalid image URL format',
});

export const createPostSchema = z
  .object({
    content: z
      .string()
      .trim()
      .max(2000, 'Content cannot exceed 2000 characters')
      .optional(),
    imageUrl: urlSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      const hasContent = Boolean(data.content && data.content.trim().length > 0);
      const hasImage = Boolean(data.imageUrl && data.imageUrl.trim().length > 0);
      return hasContent || hasImage;
    },
    {
      message: 'Post must contain either text content or an image',
      path: ['content'],
    }
  );

export const updatePostSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, 'Content cannot be empty if provided')
      .max(2000, 'Content cannot exceed 2000 characters')
      .optional(),
    imageUrl: urlSchema.nullable().optional(),
  })
  .refine(
    (data) => data.content !== undefined || data.imageUrl !== undefined,
    {
      message: 'At least one field (content or imageUrl) must be provided for update',
    }
  );

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;