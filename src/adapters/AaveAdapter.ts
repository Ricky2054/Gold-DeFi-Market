import { ethers } from 'ethers';
import type { IProtocolAdapter } from './IProtocolAdapter';
import type { LendingMarket, CollateralToken, Chain, BorrowAsset } from '../types';
import { config } from '../config/env';

const AAVE_DATA_PROVIDER_ABI = [
    'function getReserveConfigurationData(address asset) external view returns (uint256 decimals, uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen)',
    'function getReserveData(address asset) external view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)',
];

const ERC20_ABI = [
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
    'function balanceOf(address account) external view returns (uint256)',
];

interface ChainConfig {
    rpcUrl: string;
    poolAddress: string;
    dataProviderAddress: string;
}

/**
 * Aave V3 Protocol Adapter
 * Fetches real-time data from Aave V3 contracts
 */
export class AaveAdapter implements IProtocolAdapter {
    private chainConfigs: Map<Chain, ChainConfig> = new Map([
        [
            'Ethereum',
            {
                rpcUrl: config.rpc.ethereum,
                poolAddress: config.aave.ethereum.pool,
                dataProviderAddress: config.aave.ethereum.dataProvider,
            },
        ],
        [
            'Arbitrum',
            {
                rpcUrl: config.rpc.arbitrum,
                poolAddress: config.aave.arbitrum.pool,
                dataProviderAddress: config.aave.arbitrum.dataProvider,
            },
        ],
        [
            'Optimism',
            {
                rpcUrl: config.rpc.optimism,
                poolAddress: config.aave.optimism.pool,
                dataProviderAddress: config.aave.optimism.dataProvider,
            },
        ],
    ]);

    private collateralAddresses: Map<Chain, Map<CollateralToken, string>> = new Map([
        [
            'Ethereum',
            new Map([
                ['XAUT', config.collateral.xaut.ethereum],
                ['PAXG', config.collateral.paxg.ethereum],
            ]),
        ],
        [
            'Arbitrum',
            new Map([
                ['XAUT', config.collateral.xaut.arbitrum],
                ['PAXG', config.collateral.paxg.arbitrum],
            ]),
        ],
    ]);

    // Common borrow assets on Aave
    private borrowAssets: Map<Chain, Array<{ symbol: string; address: string }>> = new Map([
        [
            'Ethereum',
            [
                { symbol: 'USDC', address: config.borrowAssets.ethereum.usdc },
                { symbol: 'USDT', address: config.borrowAssets.ethereum.usdt },
                { symbol: 'DAI', address: config.borrowAssets.ethereum.dai },
                { symbol: 'WETH', address: config.borrowAssets.ethereum.weth },
            ],
        ],
        [
            'Arbitrum',
            [
                { symbol: 'USDC', address: config.borrowAssets.arbitrum.usdc },
                { symbol: 'USDT', address: config.borrowAssets.arbitrum.usdt },
                { symbol: 'DAI', address: config.borrowAssets.arbitrum.dai },
                { symbol: 'WETH', address: config.borrowAssets.arbitrum.weth },
            ],
        ],
    ]);

    getProtocolName(): string {
        return 'Aave';
    }

    getSupportedChains(): Chain[] {
        return Array.from(this.chainConfigs.keys());
    }

    async fetchMarkets(collateral: CollateralToken, chain: Chain): Promise<LendingMarket[]> {
        const config = this.chainConfigs.get(chain);
        if (!config) {
            console.warn(`Chain ${chain} not supported by Aave adapter`);
            return [];
        }

        const collateralAddress = this.collateralAddresses.get(chain)?.get(collateral);
        if (!collateralAddress) {
            console.warn(`Collateral ${collateral} not found on ${chain} for Aave`);
            return [];
        }

        console.log(`📡 [Aave] Fetching real-time data for ${collateral} on ${chain}`);
        console.log(`📡 [Aave] RPC URL: ${config.rpcUrl}`);
        console.log(`📡 [Aave] Collateral address: ${collateralAddress}`);

        try {
            const provider = new ethers.JsonRpcProvider(config.rpcUrl);
            const dataProvider = new ethers.Contract(
                config.dataProviderAddress,
                AAVE_DATA_PROVIDER_ABI,
                provider
            );

            console.log(`📡 [Aave] Making RPC call to getReserveConfigurationData...`);
            // Fetch collateral configuration
            const collateralConfig = await dataProvider.getReserveConfigurationData(collateralAddress);

            const maxLTV = Number(collateralConfig[1]) / 10000; // Convert basis points to decimal
            const liquidationThreshold = Number(collateralConfig[2]) / 10000;

            console.log(`✅ [Aave] Collateral config fetched - LTV: ${(maxLTV * 100).toFixed(2)}%, Liquidation: ${(liquidationThreshold * 100).toFixed(2)}%`);

            // Fetch borrow assets data
            const borrowAssetsData = await this.fetchBorrowAssets(chain, provider, dataProvider);

            console.log(`✅ [Aave] Fetched ${borrowAssetsData.length} borrow assets for ${collateral} on ${chain}`);

            const market: LendingMarket = {
                protocol: 'Aave',
                chain,
                collateral,
                collateralAddress,
                borrowAssets: borrowAssetsData,
                maxLTV,
                liquidationThreshold,
            };

            return [market];
        } catch (error) {
            console.error(`❌ [Aave] Error fetching market for ${collateral} on ${chain}:`, error);
            return [];
        }
    }

    private async fetchBorrowAssets(
        chain: Chain,
        provider: ethers.JsonRpcProvider,
        dataProvider: ethers.Contract
    ): Promise<BorrowAsset[]> {
        const assets = this.borrowAssets.get(chain) || [];
        const borrowAssets: BorrowAsset[] = [];

        console.log(`📡 [Aave] Fetching ${assets.length} borrow assets...`);

        for (const asset of assets) {
            try {
                console.log(`  📡 [Aave] Fetching ${asset.symbol} data...`);
                const reserveData = await dataProvider.getReserveData(asset.address);
                const tokenContract = new ethers.Contract(asset.address, ERC20_ABI, provider);
                const decimals = await tokenContract.decimals();

                // availableLiquidity is in wei, convert to human-readable
                const availableLiquidity = Number(ethers.formatUnits(reserveData[0], decimals));

                // variableBorrowRate is in ray (1e27), convert to APR percentage
                const borrowAPR = Number(reserveData[4]) / 1e25; // Convert to percentage

                console.log(`  ✅ [Aave] ${asset.symbol}: APR=${borrowAPR.toFixed(2)}%, Liquidity=$${availableLiquidity.toLocaleString()}`);

                borrowAssets.push({
                    symbol: asset.symbol,
                    address: asset.address,
                    borrowAPR,
                    availableLiquidity,
                    decimals: Number(decimals),
                });
            } catch (error) {
                console.error(`  ❌ [Aave] Error fetching data for ${asset.symbol}:`, error);
            }
        }

        return borrowAssets;
    }
}
