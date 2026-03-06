declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: string;
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

export { };