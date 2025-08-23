import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { signIn } from "@/server/services/auth.services";
import { verifyJwt } from "@/lib/jwt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export const authRouter = createTRPCRouter({
  login: publicProcedure.input(loginSchema).mutation(async ({ input }) => {
    const { email, password, rememberMe } = input;
    const jwt = await signIn(email, password, rememberMe);

    return { message: "Authentication successful", success: true, jwt, email };
  }),
  me: publicProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const t = input.token;
      if (!t) {
        return null
      }
      const u = await verifyJwt(t);
      return {
        message: "User data retrieved successfully",
        email: u?.email as string,
      };
    }),
});
