declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
      userId?: string;
    }
  }
}

export {};