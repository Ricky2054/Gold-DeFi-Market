import type { MarketRecommendation } from '../types';
import { Card, CardHeader, CardContent, ScoreGauge, Metric, MetricGrid, ProtocolBadge, ChainBadge } from './ui';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, Droplets, Shield, Target, Sparkles, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface RecommendationProps {
    recommendation: MarketRecommendation;
}

export function Recommendation({ recommendation }: RecommendationProps) {
    const { market, borrowAsset, score, reasons, warnings } = recommendation;
    const [showDetails, setShowDetails] = useState(false);

    const formatLiquidity = (amount: number): string => {
        if (amount <= 0) return 'Not Listed';
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(2)}M`;
        }
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toFixed(0)}`;
    };

    const formatAPR = (apr: number): string => {
        if (apr <= 0) return 'N/A';
        return `${apr.toFixed(2)}%`;
    };

    const formatPercentage = (value: number): string => {
        if (value <= 0) return 'Not Listed';
        return `${(value * 100).toFixed(0)}%`;
    };

    const isListed = market.maxLTV > 0 && borrowAsset.borrowAPR > 0;

    return (
        <motion.div
            className="recommendation-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card variant="gradient" hoverable={false} className="recommendation-card">
                <CardHeader className="recommendation-header">
                    <div className="recommendation-title-section">
                        <div className="recommendation-icon-wrapper">
                            <Sparkles className="recommendation-sparkle" size={24} />
                            <Target size={32} />
                        </div>
                        <div>
                            <h2 className="recommendation-main-title">Top Recommendation</h2>
                            <p className="recommendation-subtitle">
                                AI-powered analysis based on rates, liquidity, and safety
                            </p>
                        </div>
                    </div>
                    <div className="recommendation-score-section">
                        <ScoreGauge score={score} label="Match Score" />
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="recommendation-summary">
                        <div className="recommendation-action">
                            <span className="action-label">Recommended Action:</span>
                            <div className="action-content">
                                <span className="action-verb">Borrow</span>
                                <span className="action-asset">{borrowAsset.symbol}</span>
                                <span className="action-connector">on</span>
                                <ProtocolBadge protocol={market.protocol} />
                                <ChainBadge chain={market.chain} />
                            </div>
                        </div>
                    </div>

                    {/* What This Means Section - For Web2 Users */}
                    <div className="recommendation-explainer">
                        <h4 className="explainer-title"><Lightbulb size={16} /> What This Means (Simple Terms)</h4>
                        {isListed ? (
                            <p className="explainer-text">
                                You can deposit your <strong>{market.collateral}</strong> gold token as security, 
                                and borrow <strong>{borrowAsset.symbol}</strong> at a <strong>{formatAPR(borrowAsset.borrowAPR)} yearly interest rate</strong>. 
                                This is like getting a loan at a bank, but using your gold as collateral instead of a credit check.
                            </p>
                        ) : (
                            <p className="explainer-text not-listed-warning">
                                ⚠️ <strong>{market.collateral}</strong> is currently <strong>not listed as collateral</strong> on {market.protocol}. 
                                This token cannot be used for borrowing on this protocol at this time.
                            </p>
                        )}
                    </div>

                    <MetricGrid columns={4} className="recommendation-metrics">
                        <Metric
                            label="Borrow Rate"
                            value={formatAPR(borrowAsset.borrowAPR)}
                            subValue={borrowAsset.borrowAPR > 0 ? "per year" : "unavailable"}
                            variant={borrowAsset.borrowAPR > 0 ? "success" : "default"}
                            icon={<TrendingUp size={14} />}
                            tooltip="The yearly interest rate you'll pay on borrowed funds. Lower is better."
                        />
                        <Metric
                            label="Available"
                            value={formatLiquidity(borrowAsset.availableLiquidity)}
                            subValue={borrowAsset.availableLiquidity > 0 ? "to borrow" : ""}
                            icon={<Droplets size={14} />}
                            tooltip="The total amount available to borrow. Higher liquidity means larger loans are possible."
                        />
                        <Metric
                            label="Max LTV"
                            value={formatPercentage(market.maxLTV)}
                            subValue={market.maxLTV > 0 ? "borrow limit" : ""}
                            icon={<Target size={14} />}
                            tooltip="The maximum you can borrow vs your collateral. 75% means you can borrow up to $75 for every $100 deposited."
                        />
                        <Metric
                            label="Safety Buffer"
                            value={market.maxLTV > 0 ? `${((market.liquidationThreshold - market.maxLTV) * 100).toFixed(1)}%` : 'N/A'}
                            subValue="before liquidation"
                            variant="success"
                            icon={<Shield size={14} />}
                            tooltip="How much room you have before your position could be liquidated. Larger buffer = safer."
                        />
                    </MetricGrid>

                    {/* Reasons & Warnings Toggle */}
                    <motion.button
                        className="details-toggle"
                        onClick={() => setShowDetails(!showDetails)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <span>{showDetails ? 'Hide Details' : 'Show Why This Is Recommended'}</span>
                        {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </motion.button>

                    <motion.div
                        className="recommendation-details"
                        initial={false}
                        animate={{ 
                            height: showDetails ? 'auto' : 0,
                            opacity: showDetails ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {reasons.length > 0 && (
                            <div className="reasons-section">
                                <h4 className="section-title success">
                                    <CheckCircle size={18} />
                                    Why This Is Recommended
                                </h4>
                                <ul className="reasons-list">
                                    {reasons.map((reason, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: showDetails ? 1 : 0, x: showDetails ? 0 : -10 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="reason-item"
                                        >
                                            <CheckCircle size={16} className="item-icon success" />
                                            {reason}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {warnings.length > 0 && (
                            <div className="warnings-section">
                                <h4 className="section-title warning">
                                    <AlertTriangle size={18} />
                                    Things to Consider
                                </h4>
                                <ul className="warnings-list">
                                    {warnings.map((warning, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: showDetails ? 1 : 0, x: showDetails ? 0 : -10 }}
                                            transition={{ delay: (reasons.length + index) * 0.1 }}
                                            className="warning-item"
                                        >
                                            <AlertTriangle size={16} className="item-icon warning" />
                                            {warning}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
