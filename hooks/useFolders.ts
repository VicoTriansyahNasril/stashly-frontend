import { useQuery } from '@tanstack/react-query';
import { getFolders } from '../lib/api';

export const useFolders = (enabled = true) =>
  useQuery({
    queryKey: ['folders'],
    queryFn: getFolders,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
