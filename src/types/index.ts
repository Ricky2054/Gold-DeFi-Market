// Core domain types for the DeFi analytics dashboard

// Gold-backed tokens
export type CollateralToken = 'XAUT' | 'PAXG' | 'KAU' | 'PMGT' | 'DGX' | 'GOLD';
export type Protocol = 'Aave' | 'Morpho' | 'Fluid';
export type Chain = 'Ethereum' | 'Arbitrum' | 'Optimism' | 'Polygon';

// Token metadata for display purposes
export const COLLATERAL_INFO: Record<CollateralToken, { name: string; description: string; issuer: string }> = {
  'XAUT': { 
    name: 'Tether Gold', 
    description: 'Each token represents 1 troy oz of gold on a London Good Delivery bar',
    issuer: 'Tether'
  },
  'PAXG': { 
    name: 'Pax Gold', 
    description: 'Each token represents 1 troy oz of London Good Delivery gold bar',
    issuer: 'Paxos'
  },
  'KAU': { 
    name: 'Kinesis Gold', 
    description: 'Each token represents 1 gram of physical gold',
    issuer: 'Kinesis Money'
  },
  'PMGT': { 
    name: 'Perth Mint Gold Token', 
    description: 'Government-backed digital gold certificate',
    issuer: 'Perth Mint (Australia)'
  },
  'DGX': { 
    name: 'Digix Gold', 
    description: 'Each token represents 1 gram of 99.99% LBMA gold',
    issuer: 'Digix'
  },
  'GOLD': { 
    name: 'Compound Gold', 
    description: 'Tokenized gold for DeFi applications',
    issuer: 'Compound'
  }
};

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
