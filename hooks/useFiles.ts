import { useQuery } from '@tanstack/react-query';
import { getFiles } from '../lib/api';
import { StashlyFile } from '../types/file';

export const useFiles = () => {
  return useQuery<{ data: StashlyFile[] }, Error>({
    queryKey: ['files'],
    queryFn: getFiles,
    staleTime: 60000, // 1 minute
  });
};
