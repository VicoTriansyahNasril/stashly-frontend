import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { getUserSettings } from '../lib/api';

/** Pengaturan pengguna login; dibagikan lewat cache React Query ke semua komponen. */
export const useUserSettings = () => {
  const { status } = useSession();
  return useQuery({
    queryKey: ['me'],
    queryFn: getUserSettings,
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000,
  });
};
