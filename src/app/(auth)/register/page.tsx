"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

export default function RegisterPage() {
  return (
    <>
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ModeToggle />
      </div>
      
      <div className="mx-auto flex w-full flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Your Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign up to get started with Kogase
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
