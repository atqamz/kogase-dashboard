import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { ApiError } from '@/lib/api-client';
import { ZodType } from 'zod';

interface UseApiFormProps<T extends FieldValues> extends UseFormProps<T> {
  schema: ZodType<T>;
  onSubmit: (data: T) => Promise<void>;
}

interface UseApiFormReturn<T extends FieldValues> extends UseFormReturn<T> {
  isSubmitting: boolean;
  formError: string | null;
  submitForm: () => Promise<void>;
}

export function useApiForm<T extends FieldValues>({
  schema,
  onSubmit,
  ...formProps
}: UseApiFormProps<T>): UseApiFormReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<T>({
    resolver: zodResolver(schema),
    ...formProps,
  });
  
  const submitForm = async () => {
    setFormError(null);
    
    try {
      setIsSubmitting(true);
      
      // Validate the form
      const isValid = await form.trigger();
      if (!isValid) return;
      
      // Get form data
      const data = form.getValues();
      
      // Submit the form
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Handle API errors
      if (error instanceof ApiError) {
        // Extract validation errors from API response
        if (error.status === 400 && error.data?.errors) {
          const validationErrors = error.data.errors;
          
          // Set errors on specific fields
          Object.entries(validationErrors).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              form.setError(field as any, { 
                type: 'server', 
                message: errors[0] 
              });
            }
          });
          
          setFormError('Please correct the errors in the form');
        } else {
          // Set generic error message
          setFormError(error.message || 'An error occurred while submitting the form');
        }
      } else {
        // Set generic error for other types of errors
        setFormError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    ...form,
    isSubmitting,
    formError,
    submitForm,
  };
}