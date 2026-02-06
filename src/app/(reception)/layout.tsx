import { LanguageProvider } from '@/contexts/LanguageContext';

export default function ReceptionKioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {children}
      </div>
    </LanguageProvider>
  );
}
