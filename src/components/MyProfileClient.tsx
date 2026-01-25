'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import ProfileEditModal from './ProfileEditModal';

interface MyProfileClientProps {
  employeeId: string;
  phone: string | null;
  email: string | null;
}

export default function MyProfileClient({ employeeId, phone, email }: MyProfileClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
      >
        <Pencil size={16} />
        <span className="hidden sm:inline">Edit Profile</span>
        <span className="sm:hidden">Edit</span>
      </button>

      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentData={{ phone: phone || '', email: email || '' }}
        employeeId={employeeId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
