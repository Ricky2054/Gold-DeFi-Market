// Core domain types for the DeFi analytics dashboard

export type CollateralToken = 'XAUT' | 'PAXG';
export type Protocol = 'Aave' | 'Morpho' | 'Fluid';
export type Chain = 'Ethereum' | 'Arbitrum' | 'Optimism' | 'Polygon';

export interface BorrowAsset {
  symbol: string;
  address: string;
  borrowAPR: number;
  availableLiquidity: number;
  decimals: number;
}

export interface LendingMarket {
  protocol: Protocol;
  chain: Chain;
  collateral: CollateralToken;
  collateralAddress: string;
  borrowAssets: BorrowAsset[];
  maxLTV: number; // e.g., 0.75 = 75%
  liquidationThreshold: number; // e.g., 0.80 = 80%
  collateralCap?: number; // Max collateral that can be deposited
}

export interface MarketRecommendation {
  market: LendingMarket;
  borrowAsset: BorrowAsset;
  score: number;
  reasons: string[];
  warnings: string[];
}

export interface RecommendationCriteria {
  minLiquidity: number; // Minimum required liquidity in USD
  maxAcceptableAPR: number; // Maximum acceptable APR
  minLiquidationBuffer: number; // Minimum buffer between LTV and liquidation threshold
}
