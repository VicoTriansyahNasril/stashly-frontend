import { useQuery } from '@tanstack/react-query';
import { getFolders, DriveFolder } from '../lib/api';

export const useFolders = () => {
  return useQuery<{ data: DriveFolder[] }, Error>({
    queryKey: ['folders'],
    queryFn: () => getFolders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
