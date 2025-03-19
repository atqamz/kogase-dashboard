import { AuthCheck } from '@/components/auth/auth-check';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthCheck requireAuth={false} redirectTo="/">
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Left side - Branding/Image */}
        <div className="hidden md:flex md:w-1/2 bg-primary/5 flex-col items-center justify-center p-10">
          <div className="max-w-md mx-auto text-center">
            <p className="text-xl mb-8 text-muted-foreground">
              The complete telemetry platform for your projects
            </p>
            <h1 className="text-4xl font-bold mb-6 text-primary">Kogase</h1>
            <p className="mt-8 text-sm text-muted-foreground">
              Track user engagement, analyze performance, and make data-driven decisions to improve your projects.
            </p>
          </div>
        </div>
        
        {/* Right side - Auth Forms */}
        <div className="flex flex-1 md:w-1/2 items-center justify-center p-4 md:p-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </AuthCheck>
  );
}