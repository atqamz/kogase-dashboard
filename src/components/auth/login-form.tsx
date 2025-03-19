'use client';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Pre-fill admin credentials for development
  const fillAdminCredentials = () => {
    form.setValue('email', 'admin@kogase.io');
    form.setValue('password', 'Admin123!');
  };

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      console.log('Attempting login with:', { email: data.email });
      
      // First try without deviceId to avoid the foreign key constraint error
      await login({
        email: data.email,
        password: data.password,
        // Omit deviceId completely to let the backend handle it
      });
    } catch (err: any) {
      console.error('Login error details:', err);
      
      // Extract more detailed error information if available
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Foreign key constraint error message is usually cryptic, make it more user-friendly
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('FK_AuthTokens_Devices_DeviceId')) {
        errorMessage = 'Authentication error. Please try again or contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your.email@example.com"
                    type="email"
                    disabled={isSubmitting}
                    {...field}
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
                    placeholder="••••••••"
                    type="password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            
            {process.env.NODE_ENV !== 'production' && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={fillAdminCredentials}
                className="w-auto"
              >
                Admin
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}