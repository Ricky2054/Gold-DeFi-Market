import { ethers } from 'ethers';
import type { IProtocolAdapter } from './IProtocolAdapter';
import type { LendingMarket, CollateralToken, Chain, BorrowAsset } from '../types';
import { config } from '../config/env';

// Morpho Blue minimal ABI
const MORPHO_ABI = [
    'function market(bytes32 id) external view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)',
    'function idToMarketParams(bytes32 id) external view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)',
];

const ERC20_ABI = [
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
    'function balanceOf(address account) external view returns (uint256)',
];

// Morpho IRM (Interest Rate Model) ABI - for future production use
// const MORPHO_IRM_ABI = [
//   'function borrowRateView(bytes32 marketId, uint256 totalBorrowAssets, uint256 totalSupplyAssets) external view returns (uint256)',
// ];

interface ChainConfig {
    rpcUrl: string;
    morphoAddress: string;
}

/**
 * Morpho Blue Protocol Adapter
 * Note: Morpho Blue uses a market-based system where each market is identified by a unique ID
 * We need to know the market IDs in advance or query them from a subgraph
 */
export class MorphoAdapter implements IProtocolAdapter {
    private chainConfigs: Map<Chain, ChainConfig> = new Map([
        [
            'Ethereum',
            {
                rpcUrl: config.rpc.ethereum,
                morphoAddress: config.morpho.ethereum,
            },
        ],
    ]);

    // Known Morpho Blue market IDs for XAUT/PAXG collateral
    // These would typically come from a subgraph or off-chain indexer
    // Format: marketId => { collateral, loanToken, chain }
    private knownMarkets: Map<
        string,
        {
            id: string;
            collateral: CollateralToken;
            collateralAddress: string;
            loanToken: string;
            loanTokenAddress: string;
            chain: Chain;
            lltv: number; // Liquidation LTV (equivalent to liquidation threshold)
            irmAddress: string;
        }
    > = new Map([
        // Example market IDs - these are placeholders and would need to be updated with real market IDs
        // In production, you'd fetch these from Morpho's subgraph or API
        [
            'xaut-usdc-eth',
            {
                id: '0x0000000000000000000000000000000000000000000000000000000000000001',
                collateral: 'XAUT',
                collateralAddress: config.collateral.xaut.ethereum,
                loanToken: 'USDC',
                loanTokenAddress: config.borrowAssets.ethereum.usdc,
                chain: 'Ethereum',
                lltv: 0.80, // 80% LLTV
                irmAddress: '0x0000000000000000000000000000000000000000',
            },
        ],
    ]);

    getProtocolName(): string {
        return 'Morpho';
    }

    getSupportedChains(): Chain[] {
        return Array.from(this.chainConfigs.keys());
    }

    async fetchMarkets(collateral: CollateralToken, chain: Chain): Promise<LendingMarket[]> {
        const config = this.chainConfigs.get(chain);
        if (!config) {
            console.warn(`Chain ${chain} not supported by Morpho adapter`);
            return [];
        }

        console.log(`📡 [Morpho] Fetching real-time data for ${collateral} on ${chain}`);

        try {
            const provider = new ethers.JsonRpcProvider(config.rpcUrl);
            const morpho = new ethers.Contract(config.morphoAddress, MORPHO_ABI, provider);

            // Filter markets by collateral and chain
            const relevantMarkets = Array.from(this.knownMarkets.values()).filter(
                (m) => m.collateral === collateral && m.chain === chain
            );

            if (relevantMarkets.length === 0) {
                console.warn(`No Morpho markets found for ${collateral} on ${chain}`);
                return [];
            }

            console.log(`📡 [Morpho] Found ${relevantMarkets.length} markets to fetch`);

            const markets: LendingMarket[] = [];

            for (const marketInfo of relevantMarkets) {
                try {
                    console.log(`  📡 [Morpho] Fetching market ${marketInfo.loanToken}...`);
                    // Fetch market data
                    const marketData = await morpho.market(marketInfo.id);

                    const totalSupplyAssets = marketData[0];
                    const totalBorrowAssets = marketData[2];

                    // Get loan token info
                    const loanTokenContract = new ethers.Contract(
                        marketInfo.loanTokenAddress,
                        ERC20_ABI,
                        provider
                    );
                    const decimals = await loanTokenContract.decimals();

                    // Calculate available liquidity
                    const availableLiquidity = Number(
                        ethers.formatUnits(totalSupplyAssets - totalBorrowAssets, decimals)
                    );

                    // Calculate borrow APR
                    // Note: This is a simplified calculation. In production, you'd call the IRM contract
                    const utilizationRate =
                        Number(totalBorrowAssets) / (Number(totalSupplyAssets) || 1);
                    const borrowAPR = this.estimateBorrowAPR(utilizationRate);

                    console.log(`  ✅ [Morpho] ${marketInfo.loanToken}: APR=${borrowAPR.toFixed(2)}%, Liquidity=$${availableLiquidity.toLocaleString()}`);

                    const borrowAsset: BorrowAsset = {
                        symbol: marketInfo.loanToken,
                        address: marketInfo.loanTokenAddress,
                        borrowAPR,
                        availableLiquidity,
                        decimals: Number(decimals),
                    };

                    // In Morpho Blue, LLTV is the liquidation threshold
                    // MaxLTV is typically slightly lower (we'll estimate as 95% of LLTV)
                    const liquidationThreshold = marketInfo.lltv;
                    const maxLTV = liquidationThreshold * 0.95;

                    const market: LendingMarket = {
                        protocol: 'Morpho',
                        chain,
                        collateral,
                        collateralAddress: marketInfo.collateralAddress,
                        borrowAssets: [borrowAsset],
                        maxLTV,
                        liquidationThreshold,
                    };

                    markets.push(market);
                } catch (error) {
                    console.error(`  ❌ [Morpho] Error fetching market ${marketInfo.id}:`, error);
                }
            }

            console.log(`✅ [Morpho] Fetched ${markets.length} markets for ${collateral} on ${chain}`);

            return markets;
        } catch (error) {
            console.error(`❌ [Morpho] Error fetching markets for ${collateral} on ${chain}:`, error);
            return [];
        }
    }

    /**
     * Simplified APR estimation based on utilization
     * In production, this would call the actual IRM contract
     */
    private estimateBorrowAPR(utilizationRate: number): number {
        // Simple linear model: 2% base + 10% * utilization
        const baseRate = 2;
        const slope = 10;
        return baseRate + slope * utilizationRate;
    }
}
