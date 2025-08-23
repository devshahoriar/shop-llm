/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const WithOutSuspense = () => {
  const router = useRouter();
  const utils = api.useUtils();
  const sp = useSearchParams();
  const redirect = sp.get("redirect") ?? "/";
  // here i use react-hook-form to manage form state
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  const loginMutate = api.auth.login.useMutation({
    onSuccess: async (data) => {
      localStorage.setItem("jwt", data.jwt);

      utils.auth.me.setQueriesData(
        {
          token: "",
        },
        {},
        {
          email: data.email,
          message: "User data retrieved successfully",
        },
      );
      router.push(redirect);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  const onSubmit = (values: FormValues) => {
    loginMutate.mutate(values);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br">
      <div className="w-full max-w-md space-y-6 rounded-xl  p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-primary">
            Mock Sign In page
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back! Please enter your credentials.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1"
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-1"
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="remember"
                      className="text-sm text-gray-600"
                    >
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Button
              disabled={loginMutate.isPending}
              type="submit"
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a href="#" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense>
      <WithOutSuspense />
    </Suspense>
  );
};

export default LoginPage;
