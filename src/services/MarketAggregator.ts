import type { IProtocolAdapter } from '../adapters/IProtocolAdapter';
import { AaveAdapter } from '../adapters/AaveAdapter';
import { MorphoAdapter } from '../adapters/MorphoAdapter';
import { FluidAdapter } from '../adapters/FluidAdapter';
import type { LendingMarket, CollateralToken, Chain } from '../types';
import { withRetry } from '../utils/retry';

/**
 * Market Aggregator Service
 * Orchestrates data fetching from all protocol adapters
 */
export class MarketAggregator {
    private adapters: IProtocolAdapter[];

    constructor() {
        this.adapters = [
            new AaveAdapter(),
            new MorphoAdapter(),
            new FluidAdapter(),
        ];
    }

    /**
     * Fetch all markets for a specific collateral across all protocols
     * Uses parallel fetching with retry logic for optimal performance
     */
    async fetchAllMarkets(collateral: CollateralToken): Promise<LendingMarket[]> {
        const allMarkets: LendingMarket[] = [];

        // Fetch from all adapters in parallel with individual retry
        const fetchPromises = this.adapters.flatMap((adapter) => {
            const chains = adapter.getSupportedChains();
            return chains.map((chain) =>
                withRetry(
                    () => adapter.fetchMarkets(collateral, chain),
                    { 
                        maxRetries: 2, 
                        baseDelay: 1500,
                        onRetry: (attempt, error) => {
                            console.warn(`⚠️ [${adapter.getProtocolName()}/${chain}] Retry ${attempt}: ${error.message}`);
                        }
                    }
                ).catch((error) => {
                    console.error(
                        `Error fetching from ${adapter.getProtocolName()} on ${chain}:`,
                        error
                    );
                    return [];
                })
            );
        });

        const results = await Promise.all(fetchPromises);

        // Flatten results
        results.forEach((markets) => {
            allMarkets.push(...markets);
        });

        return allMarkets;
    }

    /**
     * Fetch markets for specific collateral and chain
     */
    async fetchMarketsByChain(
        collateral: CollateralToken,
        chain: Chain
    ): Promise<LendingMarket[]> {
        const allMarkets: LendingMarket[] = [];

        const fetchPromises = this.adapters.map((adapter) =>
            adapter
                .fetchMarkets(collateral, chain)
                .catch((error) => {
                    console.error(
                        `Error fetching from ${adapter.getProtocolName()} on ${chain}:`,
                        error
                    );
                    return [];
                })
        );

        const results = await Promise.all(fetchPromises);

        results.forEach((markets) => {
            allMarkets.push(...markets);
        });

        return allMarkets;
    }

    /**
     * Get all supported chains across all protocols
     */
    getSupportedChains(): Chain[] {
        const chains = new Set<Chain>();
        this.adapters.forEach((adapter) => {
            adapter.getSupportedChains().forEach((chain) => chains.add(chain));
        });
        return Array.from(chains);
    }

    /**
     * Get all protocol names
     */
    getProtocols(): string[] {
        return this.adapters.map((adapter) => adapter.getProtocolName());
    }
}
