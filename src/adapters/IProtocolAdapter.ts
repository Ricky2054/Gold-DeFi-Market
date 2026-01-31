import type { LendingMarket, CollateralToken, Chain } from '../types';

/**
 * Protocol adapter interface - each protocol implements this
 * to provide normalized market data
 */
export interface IProtocolAdapter {
    /**
     * Fetch all lending markets for a specific collateral token
     * @param collateral - The collateral token (XAUT or PAXG)
     * @param chain - The blockchain network
     * @returns Array of lending markets
     */
    fetchMarkets(collateral: CollateralToken, chain: Chain): Promise<LendingMarket[]>;

    /**
     * Get the protocol name
     */
    getProtocolName(): string;

    /**
     * Get supported chains for this protocol
     */
    getSupportedChains(): Chain[];
}
