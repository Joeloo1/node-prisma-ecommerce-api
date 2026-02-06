export interface JwtPayload {
  id: string;
  role: "USER" | "ADMIN";
  iat: number;
  exp?: number;
}
