"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {
  return (
    <>
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ModeToggle />
      </div>
      
      <div className="mx-auto flex w-full flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              <span>Don&apos;t have an account? </span>
              <Link
                href="/register"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
