/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { env } from '@/env';
import * as jose from "jose";

const secret:string = env.SECRET_JWT

const encodeSec = new TextEncoder().encode(secret);
const alg = "HS256";

export const getJwt = async (
  email: string,
  password: string,
  rememberMe?: boolean,
) => {
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }
  if (!email || !password) {
    throw new Error("Email and password are required to generate JWT");
  }
  const jwt = await new jose.SignJWT({
    id: Math.random().toString(36).substring(2),
    email: email,
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(email)
    .setAudience("public")
    .setExpirationTime(rememberMe ? "30d" : "2h")
    .sign(encodeSec);

  return jwt;
};

export const verifyJwt = async (token: string) => {
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }
  try {
    const { payload } = await jose.jwtVerify(token, encodeSec, {
      algorithms: [alg],
    });
    return payload;
  } catch (error) {
    // If verification fails, return null, it shows error in console
    return null;
  }
};
