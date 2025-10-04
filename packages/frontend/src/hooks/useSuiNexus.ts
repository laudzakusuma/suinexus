import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount } from '@mysten/dapp-kit';
import ApiService from '../services/api';

export function useEntities() {
  const account = useCurrentAccount();
  
  return useQuery({
    queryKey: ['entities', account?.address],
    queryFn: () => ApiService.getEntitiesByOwner(account!.address),
    enabled: !!account,
    staleTime: 30000,
  });
}

export function useAssets() {
  const account = useCurrentAccount();
  
  return useQuery({
    queryKey: ['assets', account?.address],
    queryFn: () => ApiService.getAssetsByOwner(account!.address),
    enabled: !!account,
    staleTime: 30000,
  });
}

export function useAsset(assetId: string | undefined) {
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => ApiService.getAsset(assetId!), // ← Changed from getAssetById to getAsset
    enabled: !!assetId,
    staleTime: 10000,
  });
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateEntities: () => queryClient.invalidateQueries({ queryKey: ['entities'] }),
    invalidateAssets: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
    invalidateAsset: (assetId: string) => queryClient.invalidateQueries({ queryKey: ['asset', assetId] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}