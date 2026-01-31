import type {
    LendingMarket,
    BorrowAsset,
    MarketRecommendation,
    RecommendationCriteria,
} from '../types';
import { config } from '../config/env';

/**
 * Recommendation Engine
 * Provides transparent, deterministic logic for recommending the best borrowing option
 */
export class RecommendationEngine {
    private criteria: RecommendationCriteria;

    constructor(criteria?: Partial<RecommendationCriteria>) {
        this.criteria = {
            minLiquidity: criteria?.minLiquidity ?? config.app.minLiquidity,
            maxAcceptableAPR: criteria?.maxAcceptableAPR ?? config.app.maxAPR,
            minLiquidationBuffer: criteria?.minLiquidationBuffer ?? config.app.minLiquidationBuffer,
        };
    }

    /**
     * Analyze all markets and return ranked recommendations
     * @param markets - All available lending markets
     * @returns Sorted array of recommendations (best first)
     */
    analyzeMarkets(markets: LendingMarket[]): MarketRecommendation[] {
        const recommendations: MarketRecommendation[] = [];

        for (const market of markets) {
            for (const borrowAsset of market.borrowAssets) {
                const recommendation = this.evaluateMarket(market, borrowAsset);
                recommendations.push(recommendation);
            }
        }

        // Sort by score (highest first)
        return recommendations.sort((a, b) => b.score - a.score);
    }

    /**
     * Evaluate a single market/borrowAsset combination
     * Returns a recommendation with transparent scoring
     */
    private evaluateMarket(
        market: LendingMarket,
        borrowAsset: BorrowAsset
    ): MarketRecommendation {
        const reasons: string[] = [];
        const warnings: string[] = [];
        let score = 100; // Start with perfect score

        // 1. Check liquidity
        if (borrowAsset.availableLiquidity < this.criteria.minLiquidity) {
            score -= 40;
            warnings.push(
                `Low liquidity: $${borrowAsset.availableLiquidity.toLocaleString()} (min: $${this.criteria.minLiquidity.toLocaleString()})`
            );
        } else if (borrowAsset.availableLiquidity > 1000000) {
            reasons.push(`Excellent liquidity: $${borrowAsset.availableLiquidity.toLocaleString()}`);
            score += 10;
        } else {
            reasons.push(`Good liquidity: $${borrowAsset.availableLiquidity.toLocaleString()}`);
        }

        // 2. Check borrow APR
        if (borrowAsset.borrowAPR > this.criteria.maxAcceptableAPR) {
            score -= 30;
            warnings.push(`High borrow rate: ${borrowAsset.borrowAPR.toFixed(2)}%`);
        } else if (borrowAsset.borrowAPR < 3) {
            reasons.push(`Excellent borrow rate: ${borrowAsset.borrowAPR.toFixed(2)}%`);
            score += 15;
        } else if (borrowAsset.borrowAPR < 5) {
            reasons.push(`Good borrow rate: ${borrowAsset.borrowAPR.toFixed(2)}%`);
            score += 5;
        } else {
            reasons.push(`Moderate borrow rate: ${borrowAsset.borrowAPR.toFixed(2)}%`);
        }

        // 3. Check liquidation buffer (safety margin)
        const liquidationBuffer = market.liquidationThreshold - market.maxLTV;
        if (liquidationBuffer < this.criteria.minLiquidationBuffer) {
            score -= 25;
            warnings.push(
                `Tight liquidation buffer: ${(liquidationBuffer * 100).toFixed(1)}% (recommended: ${(this.criteria.minLiquidationBuffer * 100).toFixed(1)}%)`
            );
        } else {
            reasons.push(
                `Safe liquidation buffer: ${(liquidationBuffer * 100).toFixed(1)}% between max LTV and liquidation`
            );
            score += 5;
        }

        // 4. Check max LTV (higher is better for capital efficiency)
        if (market.maxLTV >= 0.80) {
            reasons.push(`High capital efficiency: ${(market.maxLTV * 100).toFixed(0)}% max LTV`);
            score += 5;
        } else if (market.maxLTV < 0.60) {
            warnings.push(`Low capital efficiency: ${(market.maxLTV * 100).toFixed(0)}% max LTV`);
            score -= 10;
        }

        // 5. Protocol reputation bonus
        if (market.protocol === 'Aave') {
            reasons.push('Battle-tested protocol with strong track record');
            score += 10;
        } else if (market.protocol === 'Morpho') {
            reasons.push('Efficient protocol with optimized rates');
            score += 5;
        }

        // 6. Chain considerations
        if (market.chain === 'Ethereum') {
            reasons.push('Ethereum mainnet - highest security and liquidity');
            score += 5;
        } else if (market.chain === 'Arbitrum') {
            reasons.push('Arbitrum - lower gas fees');
            score += 3;
        }

        // Ensure score stays within 0-100 range
        score = Math.max(0, Math.min(100, score));

        return {
            market,
            borrowAsset,
            score,
            reasons,
            warnings,
        };
    }

    /**
     * Get a human-readable explanation of the top recommendation
     */
    getTopRecommendationExplanation(recommendations: MarketRecommendation[]): string {
        if (recommendations.length === 0) {
            return 'No markets available for the selected criteria.';
        }

        const top = recommendations[0];
        const { market, borrowAsset } = top;

        let explanation = `**Best Option: Borrow ${borrowAsset.symbol} on ${market.protocol} (${market.chain})**\n\n`;

        explanation += `**Why this is recommended:**\n`;
        top.reasons.forEach((reason, i) => {
            explanation += `${i + 1}. ${reason}\n`;
        });

        if (top.warnings.length > 0) {
            explanation += `\n**Important considerations:**\n`;
            top.warnings.forEach((warning) => {
                explanation += `⚠️ ${warning}\n`;
            });
        }

        explanation += `\n**Key Metrics:**\n`;
        explanation += `- Borrow APR: ${borrowAsset.borrowAPR.toFixed(2)}%\n`;
        explanation += `- Available Liquidity: $${borrowAsset.availableLiquidity.toLocaleString()}\n`;
        explanation += `- Max LTV: ${(market.maxLTV * 100).toFixed(0)}%\n`;
        explanation += `- Liquidation Threshold: ${(market.liquidationThreshold * 100).toFixed(0)}%\n`;
        explanation += `- Safety Buffer: ${((market.liquidationThreshold - market.maxLTV) * 100).toFixed(1)}%\n`;

        return explanation;
    }

    /**
     * Compare two specific markets
     */
    compareMarkets(rec1: MarketRecommendation, rec2: MarketRecommendation): string {
        const diff = rec1.score - rec2.score;
        const better = diff > 0 ? rec1 : rec2;
        const worse = diff > 0 ? rec2 : rec1;

        let comparison = `**Comparing ${rec1.market.protocol} vs ${rec2.market.protocol}**\n\n`;

        comparison += `${better.market.protocol} scores ${Math.abs(diff).toFixed(0)} points higher because:\n`;

        // APR comparison
        const aprDiff = worse.borrowAsset.borrowAPR - better.borrowAsset.borrowAPR;
        if (Math.abs(aprDiff) > 0.1) {
            comparison += `- ${aprDiff > 0 ? 'Lower' : 'Higher'} borrow rate (${better.borrowAsset.borrowAPR.toFixed(2)}% vs ${worse.borrowAsset.borrowAPR.toFixed(2)}%)\n`;
        }

        // Liquidity comparison
        const liqDiff = better.borrowAsset.availableLiquidity - worse.borrowAsset.availableLiquidity;
        if (Math.abs(liqDiff) > 10000) {
            comparison += `- ${liqDiff > 0 ? 'Higher' : 'Lower'} available liquidity ($${Math.abs(liqDiff).toLocaleString()} difference)\n`;
        }

        return comparison;
    }
}
