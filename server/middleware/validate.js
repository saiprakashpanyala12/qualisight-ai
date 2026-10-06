import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Must be a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' })
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Must be a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export const inspectionMetadataSchema = z.object({
  title: z.string().optional(),
  category: z.string().optional()
});

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: err.issues.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(400).json({ error: 'Invalid request data' });
  }
};
