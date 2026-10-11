import { useQuery } from '@tanstack/react-query';
import { getTrashFiles } from '../lib/api';
import { StashlyFile } from '../types/file';

export const useTrashFiles = () => {
  return useQuery<{ data: StashlyFile[] }, Error>({
    queryKey: ['trash'],
    queryFn: getTrashFiles,
    staleTime: 10000, // 10 seconds
  });
};
