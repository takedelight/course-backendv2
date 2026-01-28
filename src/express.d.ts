declare module 'express' {
  interface Request {
    user: JwtPayload;
    cookies: {
      userId?: string;
      userRole?: string;
    };
  }
}

export {};
