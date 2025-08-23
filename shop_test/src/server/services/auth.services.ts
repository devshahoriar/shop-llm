"use server";
import { getJwt } from "@/lib/jwt";

export const signIn = async (
  email: string,
  password: string,
  rememberMe?: boolean,
) => {
  // lot of thing happend here
  // database call
  // password match etc
  const jwt = await getJwt(email, password, rememberMe);
  return jwt;
};
