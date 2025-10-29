// Express type extensions for authenticated requests
declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      username: string;
    };
  }
}
