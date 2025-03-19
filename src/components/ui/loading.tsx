import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  message?: string;
}

export function Loading({ size = 'md', fullPage = false, message }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const loader = (
    <div className={`flex items-center justify-center ${fullPage ? 'h-screen' : 'h-40'}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );

  return loader;
}