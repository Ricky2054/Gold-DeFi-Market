import type { LendingMarket, BorrowAsset } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, TrendingUp, Shield, AlertTriangle, ExternalLink, Info, Droplets, Target, Lock } from 'lucide-react';
import { ProtocolBadge, ChainBadge, CollateralBadge, Metric, MetricGrid } from './ui';

interface MarketDetailModalProps {
    market: LendingMarket | null;
    isOpen: boolean;
    onClose: () => void;
}

export function MarketDetailModal({ market, isOpen, onClose }: MarketDetailModalProps) {
    if (!market) return null;

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

    const getProtocolUrl = (protocol: string, chain: string): string => {
        const urls: Record<string, Record<string, string>> = {
            'AAVE': {
                'Ethereum': 'https://app.aave.com/?marketName=proto_mainnet_v3',
                'Arbitrum': 'https://app.aave.com/?marketName=proto_arbitrum_v3',
                'Optimism': 'https://app.aave.com/?marketName=proto_optimism_v3',
                'Polygon': 'https://app.aave.com/?marketName=proto_polygon_v3',
            },
            'MORPHO': {
                'Ethereum': 'https://app.morpho.org/',
            },
            'FLUID': {
                'Ethereum': 'https://app.fluid.io/',
            },
        };
        return urls[protocol]?.[chain] || '#';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Modal */}
                    <motion.div
                        className="market-detail-modal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="modal-header">
                            <div className="modal-badges">
                                <ProtocolBadge protocol={market.protocol} />
                                <ChainBadge chain={market.chain} />
                                <CollateralBadge collateral={market.collateral} />
                            </div>
                            <button className="modal-close" onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="modal-content">
                            {/* Overview Section */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">
                                    <Info size={18} />
                                    Market Overview
                                </h3>
                                <p className="modal-section-description">
                                    This market allows you to deposit <strong>{market.collateral}</strong> as collateral 
                                    and borrow various assets against it on the {market.protocol} protocol.
                                </p>
                            </div>

                            {/* Key Metrics */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">
                                    <Target size={18} />
                                    Key Metrics
                                </h3>
                                <MetricGrid columns={2} className="modal-metrics">
                                    <Metric
                                        label="Max Loan-to-Value (LTV)"
                                        value={`${(market.maxLTV * 100).toFixed(0)}%`}
                                        tooltip="The maximum percentage of your collateral value you can borrow. Example: 75% LTV means you can borrow up to $75 for every $100 of collateral."
                                        icon={<TrendingUp size={14} />}
                                    />
                                    <Metric
                                        label="Liquidation Threshold"
                                        value={`${(market.liquidationThreshold * 100).toFixed(0)}%`}
                                        tooltip="If your loan reaches this percentage of your collateral value, your position will be liquidated."
                                        variant="warning"
                                        icon={<AlertTriangle size={14} />}
                                    />
                                    <Metric
                                        label="Safety Buffer"
                                        value={`${(liquidationBuffer * 100).toFixed(1)}%`}
                                        subValue={safetyLevel.label}
                                        variant={safetyLevel.variant}
                                        tooltip="The buffer between your max borrow amount and liquidation. Larger is safer."
                                        icon={<Shield size={14} />}
                                    />
                                    {market.collateralCap && (
                                        <Metric
                                            label="Collateral Cap"
                                            value={formatLiquidity(market.collateralCap)}
                                            tooltip="Maximum collateral the protocol accepts for this market."
                                            icon={<Lock size={14} />}
                                        />
                                    )}
                                </MetricGrid>
                            </div>

                            {/* Borrowable Assets */}
                            <div className="modal-section">
                                <h3 className="modal-section-title">
                                    <Droplets size={18} />
                                    Available Assets to Borrow
                                </h3>
                                <div className="modal-assets-grid">
                                    {market.borrowAssets.map((asset: BorrowAsset) => {
                                        const liquidityStatus = getLiquidityStatus(asset.availableLiquidity);
                                        const aprColor = getAPRColor(asset.borrowAPR);
                                        return (
                                            <div key={asset.address} className="modal-asset-card">
                                                <div className="modal-asset-header">
                                                    <span className="modal-asset-symbol">{asset.symbol}</span>
                                                    <span className={`modal-asset-apr ${aprColor}`}>
                                                        <TrendingDown size={14} />
                                                        {asset.borrowAPR.toFixed(2)}% APR
                                                    </span>
                                                </div>
                                                <div className="modal-asset-details">
                                                    <div className="modal-asset-row">
                                                        <span className="modal-asset-label">Available Liquidity</span>
                                                        <span className={`modal-asset-value ${liquidityStatus.variant}`}>
                                                            {formatLiquidity(asset.availableLiquidity)}
                                                        </span>
                                                    </div>
                                                    <div className="modal-asset-row">
                                                        <span className="modal-asset-label">Liquidity Status</span>
                                                        <span className={`modal-asset-status ${liquidityStatus.variant}`}>
                                                            {liquidityStatus.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* What This Means */}
                            <div className="modal-section modal-explainer">
                                <h3 className="modal-section-title">
                                    <Info size={18} />
                                    What This Means (Simple Terms)
                                </h3>
                                <div className="modal-explainer-content">
                                    <p>
                                        <strong>How it works:</strong> You deposit your {market.collateral} gold token as collateral (like a security deposit), 
                                        and you can borrow up to {(market.maxLTV * 100).toFixed(0)}% of its value in other cryptocurrencies.
                                    </p>
                                    <p>
                                        <strong>Risk level:</strong> If the value of your collateral drops (or your loan grows due to interest) 
                                        beyond {(market.liquidationThreshold * 100).toFixed(0)}% of your collateral, your position may be "liquidated" — 
                                        meaning the protocol sells your gold to repay the loan.
                                    </p>
                                    <p>
                                        <strong>Safety tip:</strong> The {(liquidationBuffer * 100).toFixed(1)}% safety buffer means you have some 
                                        breathing room between your max borrow and liquidation. {safetyLevel.label === 'Very Safe' 
                                            ? 'This market has a good safety margin.' 
                                            : safetyLevel.label === 'Moderate' 
                                                ? 'Be cautious and monitor your position.' 
                                                : 'This market has a tight safety margin — proceed with caution.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <a 
                                href={getProtocolUrl(market.protocol, market.chain)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="modal-cta-button"
                            >
                                Open on {market.protocol}
                                <ExternalLink size={16} />
                            </a>
                            <button className="modal-secondary-button" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
