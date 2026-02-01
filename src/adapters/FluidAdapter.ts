import { ethers } from 'ethers';
import type { IProtocolAdapter } from './IProtocolAdapter';
import type { LendingMarket, CollateralToken, Chain, BorrowAsset } from '../types';
import { config } from '../config/env';
import { withRetry } from '../utils/retry';
import { getProvider } from '../utils/provider';

// Fluid Liquidity minimal ABI - for future production use
// const FLUID_LIQUIDITY_ABI = [
//   'function getVaultVariables(address vault) external view returns (uint256)',
//   'function getVaultConfig(address vault) external view returns (uint256)',
// ];

const ERC20_ABI = [
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
    'function balanceOf(address account) external view returns (uint256)',
];

interface ChainConfig {
    rpcUrl: string;
    liquidityAddress: string;
}

/**
 * Fluid Protocol Adapter
 * Note: Fluid is a newer protocol with vault-based lending
 * Each vault has specific collateral and borrow token pairs
 */
export class FluidAdapter implements IProtocolAdapter {
    private chainConfigs: Map<Chain, ChainConfig> = new Map([
        [
            'Ethereum',
            {
                rpcUrl: config.rpc.ethereum,
                liquidityAddress: config.fluid.ethereum,
            },
        ],
    ]);

    // Known Fluid vaults for gold-backed collateral
    // In production, these would come from Fluid's API or subgraph
    private knownVaults: Map<
        string,
        {
            vaultAddress: string;
            collateral: CollateralToken;
            collateralAddress: string;
            loanToken: string;
            loanTokenAddress: string;
            chain: Chain;
            maxLTV: number;
            liquidationThreshold: number;
        }
    > = new Map([
        // XAUT Vaults
        [
            'xaut-usdc-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000001',
                collateral: 'XAUT',
                collateralAddress: config.collateral.xaut.ethereum,
                loanToken: 'USDC',
                loanTokenAddress: config.borrowAssets.ethereum.usdc,
                chain: 'Ethereum',
                maxLTV: 0.75,
                liquidationThreshold: 0.80,
            },
        ],
        [
            'xaut-dai-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000007',
                collateral: 'XAUT',
                collateralAddress: config.collateral.xaut.ethereum,
                loanToken: 'DAI',
                loanTokenAddress: config.borrowAssets.ethereum.dai,
                chain: 'Ethereum',
                maxLTV: 0.70,
                liquidationThreshold: 0.78,
            },
        ],
        // PAXG Vaults
        [
            'paxg-usdc-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000002',
                collateral: 'PAXG',
                collateralAddress: config.collateral.paxg.ethereum,
                loanToken: 'USDC',
                loanTokenAddress: config.borrowAssets.ethereum.usdc,
                chain: 'Ethereum',
                maxLTV: 0.75,
                liquidationThreshold: 0.80,
            },
        ],
        [
            'paxg-weth-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000008',
                collateral: 'PAXG',
                collateralAddress: config.collateral.paxg.ethereum,
                loanToken: 'WETH',
                loanTokenAddress: config.borrowAssets.ethereum.weth,
                chain: 'Ethereum',
                maxLTV: 0.65,
                liquidationThreshold: 0.75,
            },
        ],
        // KAU Vaults
        [
            'kau-usdc-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000003',
                collateral: 'KAU',
                collateralAddress: config.collateral.kau.ethereum,
                loanToken: 'USDC',
                loanTokenAddress: config.borrowAssets.ethereum.usdc,
                chain: 'Ethereum',
                maxLTV: 0.65,
                liquidationThreshold: 0.72,
            },
        ],
        // DGX Vaults
        [
            'dgx-usdc-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000004',
                collateral: 'DGX',
                collateralAddress: config.collateral.dgx.ethereum,
                loanToken: 'USDC',
                loanTokenAddress: config.borrowAssets.ethereum.usdc,
                chain: 'Ethereum',
                maxLTV: 0.60,
                liquidationThreshold: 0.70,
            },
        ],
        // PMGT Vaults
        [
            'pmgt-usdc-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000005',
                collateral: 'PMGT',
                collateralAddress: config.collateral.pmgt.ethereum,
                loanToken: 'USDC',
                loanTokenAddress: config.borrowAssets.ethereum.usdc,
                chain: 'Ethereum',
                maxLTV: 0.70,
                liquidationThreshold: 0.78,
            },
        ],
        [
            'pmgt-dai-vault',
            {
                vaultAddress: '0x0000000000000000000000000000000000000009',
                collateral: 'PMGT',
                collateralAddress: config.collateral.pmgt.ethereum,
                loanToken: 'DAI',
                loanTokenAddress: config.borrowAssets.ethereum.dai,
                chain: 'Ethereum',
                maxLTV: 0.68,
                liquidationThreshold: 0.76,
            },
        ],
    ]);

    getProtocolName(): string {
        return 'Fluid';
    }

    getSupportedChains(): Chain[] {
        return Array.from(this.chainConfigs.keys());
    }

    async fetchMarkets(collateral: CollateralToken, chain: Chain): Promise<LendingMarket[]> {
        const chainConfig = this.chainConfigs.get(chain);
        if (!chainConfig) {
            console.warn(`Chain ${chain} not supported by Fluid adapter`);
            return [];
        }

        try {
            const provider = await getProvider(chain);

            // Filter vaults by collateral and chain
            const relevantVaults = Array.from(this.knownVaults.values()).filter(
                (v) => v.collateral === collateral && v.chain === chain
            );

            if (relevantVaults.length === 0) {
                console.warn(`No Fluid vaults found for ${collateral} on ${chain}`);
                return [];
            }

            const markets: LendingMarket[] = [];

            for (const vaultInfo of relevantVaults) {
                try {
                    // Get loan token info with retry
                    const [decimals, balance] = await withRetry(async () => {
                        const loanTokenContract = new ethers.Contract(
                            vaultInfo.loanTokenAddress,
                            ERC20_ABI,
                            provider
                        );
                        const dec = await loanTokenContract.decimals();
                        const bal = await loanTokenContract.balanceOf(vaultInfo.vaultAddress);
                        return [dec, bal];
                    }, { maxRetries: 3, baseDelay: 1000 });

                    // Available liquidity is the vault's balance of the loan token
                    const availableLiquidity = Number(ethers.formatUnits(balance, decimals));

                    // Estimate borrow APR (simplified - in production would fetch from vault contract)
                    const borrowAPR = this.estimateBorrowAPR(availableLiquidity);

                    const borrowAsset: BorrowAsset = {
                        symbol: vaultInfo.loanToken,
                        address: vaultInfo.loanTokenAddress,
                        borrowAPR,
                        availableLiquidity,
                        decimals: Number(decimals),
                    };

                    const market: LendingMarket = {
                        protocol: 'Fluid',
                        chain,
                        collateral,
                        collateralAddress: vaultInfo.collateralAddress,
                        borrowAssets: [borrowAsset],
                        maxLTV: vaultInfo.maxLTV,
                        liquidationThreshold: vaultInfo.liquidationThreshold,
                    };

                    markets.push(market);
                } catch (error) {
                    console.error(`Error fetching Fluid vault ${vaultInfo.vaultAddress}:`, error);
                }
            }

            return markets;
        } catch (error) {
            console.error(`Error fetching Fluid markets for ${collateral} on ${chain}:`, error);
            return [];
        }
    }

    /**
     * Simplified APR estimation
     * In production, this would fetch from the vault's interest rate model
     */
    private estimateBorrowAPR(availableLiquidity: number): number {
        // Simple model: higher liquidity = lower rate
        if (availableLiquidity > 1000000) return 3.5;
        if (availableLiquidity > 100000) return 4.5;
        return 6.0;
    }
}
