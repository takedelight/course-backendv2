import { JwtPayload } from './shared/types/jwt-payload.type';

declare module 'express' {
  interface Request {
    user: JwtPayload;
    cookies: {
      refresh_token?: string;
    };
  }
}

export {};
