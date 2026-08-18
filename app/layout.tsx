import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import RoleSwitcher from '@/components/RoleSwitcher';
import ToastContainer from '@/components/ToastContainer';
import FloatingCartBar from '@/components/FloatingCartBar';

export const metadata: Metadata = {
  title: 'Sappha PreOrder | เว็บสั่งอาหารล่วงหน้า โรงเรียนสรรพวิทยาคม',
  description: 'แพลตฟอร์มสั่งอาหารล่วงหน้าภายในโรงเรียนสรรพวิทยาคม สั่งวันนี้ รับพรุ่งนี้เช้า 06:45 - 07:45 น.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-brand-500 selection:text-white">
        <AppProvider>
          {/* Top Navbar */}
          <Navbar />

          {/* Main Viewport Content */}
          <main className="flex-1 pb-24 md:pb-16">{children}</main>

          {/* Sticky Floating Cart Indicator */}
          <FloatingCartBar />

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          {/* 1-Click Role Switcher (Student / Merchant / Admin) */}
          <RoleSwitcher />

          {/* Toasts */}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
