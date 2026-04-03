'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCommunityConfig, fetchCommunityUsage } from '@/lib/community/api-client'
import type { CommunityConfig, CommunityUsage } from '@/lib/community/types'

/**
 * Hook to fetch community feature configurations
 */
export function useCommunityConfig() {
  return useQuery<CommunityConfig>({
    queryKey: ['community.config'],
    queryFn: fetchCommunityConfig,
  });
}

/**
 * Hook to fetch community usage limits and current usage
 */
export function useCommunityUsage() {
  return useQuery<CommunityUsage>({
    queryKey: ['community.usage'],
    queryFn: fetchCommunityUsage,
  })
}
