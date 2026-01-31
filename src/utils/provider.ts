/**
 * RPC Provider Factory with Fallback Support
 * Creates reliable providers with multiple fallback endpoints
 */

import { ethers } from 'ethers';
import type { Chain } from '../types';

// Multiple RPC endpoints per chain for fallback
const RPC_ENDPOINTS: Record<Chain, string[]> = {
  Ethereum: [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
    'https://1rpc.io/eth',
    'https://eth.drpc.org',
  ],
  Arbitrum: [
    'https://arbitrum.llamarpc.com',
    'https://rpc.ankr.com/arbitrum',
    'https://arbitrum-one.publicnode.com',
    'https://1rpc.io/arb',
    'https://arb1.arbitrum.io/rpc',
  ],
  Optimism: [
    'https://optimism.llamarpc.com',
    'https://rpc.ankr.com/optimism',
    'https://optimism.publicnode.com',
    'https://1rpc.io/op',
    'https://mainnet.optimism.io',
  ],
  Polygon: [
    'https://polygon.llamarpc.com',
    'https://rpc.ankr.com/polygon',
    'https://polygon.publicnode.com',
    'https://1rpc.io/matic',
    'https://polygon-rpc.com',
  ],
};

// Cache for working providers to avoid re-testing
const providerCache: Map<Chain, ethers.JsonRpcProvider> = new Map();
const lastSuccessfulEndpoint: Map<Chain, string> = new Map();

/**
 * Get a working RPC provider for the specified chain
 * Tests endpoints and caches working ones
 */
export async function getProvider(chain: Chain): Promise<ethers.JsonRpcProvider> {
  // Return cached provider if available
  const cached = providerCache.get(chain);
  if (cached) {
    // Verify it's still working with a simple call
    try {
      await cached.getBlockNumber();
      return cached;
    } catch {
      // Cache invalid, clear it
      providerCache.delete(chain);
      lastSuccessfulEndpoint.delete(chain);
    }
  }

  const endpoints = RPC_ENDPOINTS[chain] || [];
  
  // Try last successful endpoint first
  const lastSuccessful = lastSuccessfulEndpoint.get(chain);
  if (lastSuccessful) {
    const orderedEndpoints = [lastSuccessful, ...endpoints.filter(e => e !== lastSuccessful)];
    const provider = await tryEndpoints(orderedEndpoints, chain);
    if (provider) return provider;
  }

  // Try all endpoints
  const provider = await tryEndpoints(endpoints, chain);
  if (provider) return provider;

  // Fallback: return a provider anyway (may fail on actual calls)
  console.error(`❌ [RPC] All endpoints failed for ${chain}, using first endpoint`);
  return new ethers.JsonRpcProvider(endpoints[0]);
}

/**
 * Try multiple endpoints and return the first working one
 */
async function tryEndpoints(endpoints: string[], chain: Chain): Promise<ethers.JsonRpcProvider | null> {
  for (const endpoint of endpoints) {
    try {
      const provider = new ethers.JsonRpcProvider(endpoint, undefined, {
        staticNetwork: true,
        batchMaxCount: 1, // Disable batching for better error handling
      });
      
      // Test with a simple call (with timeout)
      const blockPromise = provider.getBlockNumber();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      await Promise.race([blockPromise, timeoutPromise]);
      
      // Cache the working provider
      providerCache.set(chain, provider);
      lastSuccessfulEndpoint.set(chain, endpoint);
      
      console.log(`✅ [RPC] Connected to ${chain} via ${new URL(endpoint).hostname}`);
      return provider;
    } catch (error) {
      console.warn(`⚠️ [RPC] Failed to connect to ${endpoint}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  return null;
}

/**
 * Clear provider cache (useful when switching networks or on errors)
 */
export function clearProviderCache(chain?: Chain): void {
  if (chain) {
    providerCache.delete(chain);
    lastSuccessfulEndpoint.delete(chain);
  } else {
    providerCache.clear();
    lastSuccessfulEndpoint.clear();
  }
}

/**
 * Get a simple provider without caching (for one-off calls)
 */
export function getSimpleProvider(rpcUrl: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(rpcUrl, undefined, {
    staticNetwork: true,
  });
}
