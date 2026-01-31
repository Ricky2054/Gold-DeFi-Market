import type { LendingMarket, BorrowAsset } from '../types';
import { Card, CardHeader, CardContent, ProtocolBadge, ChainBadge, CollateralBadge, Metric, MetricGrid } from './ui';
import { InfoTooltip } from './ui/Tooltip';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Shield, AlertTriangle, DollarSign } from 'lucide-react';

interface MarketCardProps {
    market: LendingMarket;
    index?: number;
}

export function MarketCard({ market, index = 0 }: MarketCardProps) {
    const liquidationBuffer = market.liquidationThreshold - market.maxLTV;

    const getAPRColor = (apr: number): 'success' | 'warning' | 'danger' | 'default' => {
        if (apr < 3) return 'success';
        if (apr < 6) return 'default';
        if (apr < 10) return 'warning';
        return 'danger';
    };

    const getLiquidityStatus = (liquidity: number): { variant: 'success' | 'warning' | 'danger' | 'default'; label: string } => {
        if (liquidity > 1000000) return { variant: 'success', label: 'High Liquidity' };
        if (liquidity > 100000) return { variant: 'default', label: 'Good Liquidity' };
        if (liquidity > 10000) return { variant: 'warning', label: 'Low Liquidity' };
        return { variant: 'danger', label: 'Very Low' };
    };

    const formatLiquidity = (amount: number): string => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(2)}M`;
        }
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toFixed(0)}`;
    };

    const getSafetyLevel = (buffer: number): { variant: 'success' | 'warning' | 'danger'; label: string } => {
        if (buffer >= 0.10) return { variant: 'success', label: 'Very Safe' };
        if (buffer >= 0.05) return { variant: 'warning', label: 'Moderate' };
        return { variant: 'danger', label: 'Risky' };
    };

    const safetyLevel = getSafetyLevel(liquidationBuffer);

    return (
        <Card variant="default" delay={index} className="market-card-new">
            <CardHeader className="market-card-header">
                <div className="market-badges">
                    <ProtocolBadge protocol={market.protocol} />
                    <ChainBadge chain={market.chain} />
                </div>
                <CollateralBadge collateral={market.collateral} />
            </CardHeader>

            <CardContent>
                <MetricGrid columns={2}>
                    <Metric
                        label="Max LTV"
                        value={`${(market.maxLTV * 100).toFixed(0)}%`}
                        tooltip="Loan-to-Value ratio: The maximum amount you can borrow relative to your collateral value. Example: 75% LTV means you can borrow up to $75 for every $100 of collateral."
                        icon={<TrendingUp size={14} />}
                    />
                    <Metric
                        label="Liquidation Threshold"
                        value={`${(market.liquidationThreshold * 100).toFixed(0)}%`}
                        tooltip="If your borrowed amount exceeds this percentage of your collateral value, your position may be liquidated (sold off) to repay the loan."
                        icon={<AlertTriangle size={14} />}
                    />
                    <Metric
                        label="Safety Buffer"
                        value={`${(liquidationBuffer * 100).toFixed(1)}%`}
                        subValue={safetyLevel.label}
                        variant={safetyLevel.variant}
                        tooltip="The difference between liquidation threshold and max LTV. A larger buffer gives you more room before liquidation if prices drop."
                        icon={<Shield size={14} />}
                    />
                    {market.collateralCap && (
                        <Metric
                            label="Collateral Cap"
                            value={formatLiquidity(market.collateralCap)}
                            tooltip="The maximum amount of this collateral the protocol accepts. Once reached, no more deposits are allowed."
                            icon={<DollarSign size={14} />}
                        />
                    )}
                </MetricGrid>

                <div className="borrow-assets-section">
                    <div className="borrow-assets-header">
                        <span className="borrow-assets-title">Available to Borrow</span>
                        <InfoTooltip content="These are the assets you can borrow by depositing your gold-backed collateral. Lower APR = cheaper to borrow." />
                    </div>
                    <div className="borrow-assets-list">
                        {market.borrowAssets.map((asset: BorrowAsset, assetIndex: number) => {
                            const liquidityStatus = getLiquidityStatus(asset.availableLiquidity);
                            return (
                                <motion.div 
                                    key={asset.address} 
                                    className="borrow-asset-row"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (index * 0.1) + (assetIndex * 0.05) }}
                                >
                                    <div className="asset-left">
                                        <div className="asset-symbol-badge">
                                            {asset.symbol}
                                        </div>
                                        <div className="asset-details">
                                            <span className={`asset-liquidity ${liquidityStatus.variant}`}>
                                                {formatLiquidity(asset.availableLiquidity)}
                                            </span>
                                            <span className="asset-liquidity-label">available</span>
                                        </div>
                                    </div>
                                    <div className="asset-right">
                                        <div className={`asset-apr ${getAPRColor(asset.borrowAPR)}`}>
                                            <TrendingDown size={14} />
                                            {asset.borrowAPR.toFixed(2)}%
                                        </div>
                                        <span className="apr-label">Borrow APR</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
