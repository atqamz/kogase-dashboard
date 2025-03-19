import { AuthCheck } from '@/components/auth/auth-check';
import Header from '@/components/navigation/header';
import Sidebar from '@/components/navigation/sidebar';
import MobileNav from '@/components/navigation/mobile-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthCheck requireAuth={true} redirectTo="/login">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center h-16 border-b px-6 md:px-8">
            <MobileNav />
            <div className="ml-auto flex items-center space-x-4">
              <Header />
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthCheck>
  );
}