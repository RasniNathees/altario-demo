import { Request, Response, NextFunction } from 'express';
// Import 'z' (the main Zod export) to access the types correctly,
// and specifically import ZodError.
import { z, ZodError  } from 'zod';

// Use a generic type constraint <T extends ZodTypeAny>
export const validate = (schema:any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The schema is defined to validate an object that includes body, query, and params
      // We can infer the resulting type if needed, but the validation works as is.
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues,
        });
      }
      // Pass other errors down the middleware chain
      next(error);
    }
  };
};