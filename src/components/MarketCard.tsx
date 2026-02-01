import type { LendingMarket, BorrowAsset } from '../types';
import type { MouseEvent } from 'react';
import { Card, CardHeader, CardContent, ProtocolBadge, ChainBadge, CollateralBadge } from './ui';
import { motion } from 'framer-motion';
import { TrendingDown, Shield, ChevronRight, Droplets } from 'lucide-react';
import { useRef } from 'react';

interface MarketCardProps {
    market: LendingMarket;
    index?: number;
    onClick?: () => void;
}

export function MarketCard({ market, index = 0, onClick }: MarketCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const liquidationBuffer = market.liquidationThreshold - market.maxLTV;

    // Handle mouse move for spotlight effect
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardRef.current.style.setProperty('--mouse-x', `${x}%`);
        cardRef.current.style.setProperty('--mouse-y', `${y}%`);
    };

    const getAPRColor = (apr: number): string => {
        if (apr < 3) return 'success';
        if (apr < 6) return 'default';
        if (apr < 10) return 'warning';
        return 'danger';
    };

    const getSafetyLevel = (buffer: number): { variant: string; label: string } => {
        if (buffer >= 0.10) return { variant: 'success', label: 'Safe' };
        if (buffer >= 0.05) return { variant: 'warning', label: 'Moderate' };
        return { variant: 'danger', label: 'Risky' };
    };

    const formatLiquidity = (amount: number): string => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
        return `$${amount.toFixed(0)}`;
    };

    const safetyLevel = getSafetyLevel(liquidationBuffer);
    
    // Get the best (lowest) APR from borrow assets
    const bestAPR = market.borrowAssets.length > 0 
        ? Math.min(...market.borrowAssets.map(a => a.borrowAPR))
        : 0;
    
    // Get total liquidity
    const totalLiquidity = market.borrowAssets.reduce((sum, a) => sum + a.availableLiquidity, 0);

    return (
        <motion.div 
            ref={cardRef} 
            onMouseMove={handleMouseMove}
            onClick={onClick}
            className="market-card-wrapper"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <Card variant="default" className="market-card-new market-card-fixed">
                {/* Header with badges */}
                <CardHeader className="market-card-header-compact">
                    <div className="market-badges">
                        <ProtocolBadge protocol={market.protocol} />
                        <ChainBadge chain={market.chain} />
                    </div>
                    <CollateralBadge collateral={market.collateral} />
                </CardHeader>

                <CardContent className="market-card-content-compact">
                    {/* Key Stats Row */}
                    <div className="market-stats-row">
                        <div className="market-stat">
                            <span className="market-stat-label">Max LTV</span>
                            <span className="market-stat-value">{(market.maxLTV * 100).toFixed(0)}%</span>
                        </div>
                        <div className="market-stat">
                            <span className="market-stat-label">Liq. Threshold</span>
                            <span className="market-stat-value">{(market.liquidationThreshold * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* Safety Badge */}
                    <div className={`market-safety-badge ${safetyLevel.variant}`}>
                        <Shield size={14} />
                        <span>{(liquidationBuffer * 100).toFixed(1)}% Buffer</span>
                        <span className="safety-label">• {safetyLevel.label}</span>
                    </div>

                    {/* Best Rate Preview */}
                    <div className="market-preview-section">
                        <div className="market-preview-header">
                            <Droplets size={14} />
                            <span>Best Rate Available</span>
                        </div>
                        <div className="market-preview-content">
                            <div className={`market-best-apr ${getAPRColor(bestAPR)}`}>
                                <TrendingDown size={16} />
                                <span className="apr-value">{bestAPR.toFixed(2)}%</span>
                                <span className="apr-label">APR</span>
                            </div>
                            <div className="market-liquidity">
                                <span className="liquidity-value">{formatLiquidity(totalLiquidity)}</span>
                                <span className="liquidity-label">Total Liquidity</span>
                            </div>
                        </div>
                    </div>

                    {/* Assets Count */}
                    <div className="market-assets-preview">
                        {market.borrowAssets.slice(0, 4).map((asset: BorrowAsset) => (
                            <span key={asset.address} className="asset-chip">
                                {asset.symbol}
                            </span>
                        ))}
                        {market.borrowAssets.length > 4 && (
                            <span className="asset-chip asset-chip-more">
                                +{market.borrowAssets.length - 4}
                            </span>
                        )}
                    </div>

                    {/* Click indicator */}
                    <div className="market-card-footer">
                        <span className="view-details-text">View Details</span>
                        <ChevronRight size={16} className="view-details-icon" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
