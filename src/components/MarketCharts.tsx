/**
 * Market Comparison Charts Component
 * 
 * Bar charts for comparing DeFi markets side by side using Apache ECharts.
 * 
 * Features:
 * - Bar charts comparing APR across markets
 * - Liquidity comparison charts
 * - LTV & Liquidation threshold comparisons
 * - Protocol grouping and color coding
 */

import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import type { LendingMarket, Protocol, Chain, CollateralToken } from '../types';
import { BarChart3, TrendingDown, Droplets, Shield, Layers } from 'lucide-react';

interface MarketChartsProps {
    markets: LendingMarket[];
    selectedCollateral: CollateralToken;
    selectedProtocol: Protocol | 'All';
    selectedChain: Chain | 'All';
}

type ChartView = 'apr' | 'liquidity' | 'ltv' | 'all';

// Protocol colors
const protocolColors: Record<Protocol, string> = {
    'Aave': '#B13EFF',
    'Morpho': '#00D4AA',
    'Fluid': '#3B82F6'
};

export function MarketCharts({ markets, selectedProtocol, selectedChain }: MarketChartsProps) {
    const [activeView, setActiveView] = useState<ChartView>('apr');

    const filteredMarkets = markets.filter(m => {
        if (selectedProtocol !== 'All' && m.protocol !== selectedProtocol) return false;
        if (selectedChain !== 'All' && m.chain !== selectedChain) return false;
        return true;
    });

    // Get market labels for x-axis
    const marketLabels = useMemo(() => {
        return filteredMarkets.map(m => `${m.protocol}\n${m.chain}`);
    }, [filteredMarkets]);

    // Gold theme colors
    const goldColor = '#D4AF37';
    const textColor = 'rgba(255, 255, 255, 0.7)';
    const gridColor = 'rgba(212, 175, 55, 0.15)';

    // APR Comparison Chart
    const aprChartOptions = useMemo(() => {
        if (filteredMarkets.length === 0) return null;

        // Get best APR from each market
        const aprData = filteredMarkets.map(m => {
            const bestAPR = Math.min(...m.borrowAssets.map(a => a.borrowAPR));
            return {
                value: bestAPR,
                itemStyle: { color: protocolColors[m.protocol] }
            };
        });

        return {
            backgroundColor: 'transparent',
            title: {
                text: 'Borrow APR Comparison',
                subtext: 'Lower is better',
                left: 'center',
                textStyle: { color: goldColor, fontSize: 16, fontWeight: 600 },
                subtextStyle: { color: textColor, fontSize: 12 }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                borderColor: goldColor,
                textStyle: { color: textColor },
                axisPointer: { type: 'shadow' },
                formatter: (params: { name: string; value: number; color: string }[]) => {
                    const data = params[0];
                    return `
                        <div style="font-family: Inter, sans-serif;">
                            <div style="color: ${goldColor}; font-weight: 600; margin-bottom: 4px;">${data.name.replace('\n', ' - ')}</div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${data.color};"></span>
                                <span>Borrow APR: <strong style="color: ${data.value < 5 ? '#22C55E' : data.value < 8 ? '#FBBF24' : '#EF4444'};">${data.value.toFixed(2)}%</strong></span>
                            </div>
                        </div>
                    `;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: marketLabels,
                axisLine: { lineStyle: { color: gridColor } },
                axisLabel: { 
                    color: textColor, 
                    fontSize: 10,
                    interval: 0,
                    rotate: 0
                },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                name: 'APR %',
                nameTextStyle: { color: textColor, fontSize: 11 },
                axisLine: { lineStyle: { color: gridColor } },
                axisLabel: { color: textColor, fontSize: 11, formatter: '{value}%' },
                splitLine: { lineStyle: { color: gridColor, type: 'dashed' } }
            },
            series: [{
                name: 'Borrow APR',
                type: 'bar',
                barWidth: '60%',
                data: aprData,
                label: {
                    show: true,
                    position: 'top',
                    color: textColor,
                    fontSize: 11,
                    formatter: '{c}%'
                }
            }]
        };
    }, [filteredMarkets, marketLabels]);

    // Liquidity Comparison Chart
    const liquidityChartOptions = useMemo(() => {
        if (filteredMarkets.length === 0) return null;

        const liquidityData = filteredMarkets.map(m => {
            const totalLiquidity = m.borrowAssets.reduce((sum, a) => sum + a.availableLiquidity, 0);
            return {
                value: totalLiquidity / 1000, // Convert to K
                itemStyle: { color: protocolColors[m.protocol] }
            };
        });

        return {
            backgroundColor: 'transparent',
            title: {
                text: 'Available Liquidity',
                subtext: 'Higher is better',
                left: 'center',
                textStyle: { color: goldColor, fontSize: 16, fontWeight: 600 },
                subtextStyle: { color: textColor, fontSize: 12 }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                borderColor: goldColor,
                textStyle: { color: textColor },
                axisPointer: { type: 'shadow' },
                formatter: (params: { name: string; value: number; color: string }[]) => {
                    const data = params[0];
                    const formatted = data.value >= 1000 
                        ? `$${(data.value / 1000).toFixed(1)}M` 
                        : `$${data.value.toFixed(0)}K`;
                    return `
                        <div style="font-family: Inter, sans-serif;">
                            <div style="color: ${goldColor}; font-weight: 600; margin-bottom: 4px;">${data.name.replace('\n', ' - ')}</div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 2px; background: ${data.color};"></span>
                                <span>Liquidity: <strong style="color: #22C55E;">${formatted}</strong></span>
                            </div>
                        </div>
                    `;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '18%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: marketLabels,
                axisLine: { lineStyle: { color: gridColor } },
                axisLabel: { color: textColor, fontSize: 10, interval: 0 },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                name: 'Liquidity ($K)',
                nameTextStyle: { color: textColor, fontSize: 11 },
                axisLine: { lineStyle: { color: gridColor } },
                axisLabel: { 
                    color: textColor, 
                    fontSize: 11, 
                    formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}M` : `${value}K`
                },
                splitLine: { lineStyle: { color: gridColor, type: 'dashed' } }
            },
            series: [{
                name: 'Liquidity',
                type: 'bar',
                barWidth: '60%',
                data: liquidityData,
                label: {
                    show: true,
                    position: 'top',
                    color: textColor,
                    fontSize: 10,
                    formatter: (params: { value: number }) => params.value >= 1000 
                        ? `$${(params.value / 1000).toFixed(1)}M` 
                        : `$${params.value.toFixed(0)}K`
                }
            }]
        };
    }, [filteredMarkets, marketLabels]);

    // LTV & Threshold Comparison Chart (Grouped Bar)
    const ltvChartOptions = useMemo(() => {
        if (filteredMarkets.length === 0) return null;

        const ltvData = filteredMarkets.map(m => (m.maxLTV * 100));
        const thresholdData = filteredMarkets.map(m => (m.liquidationThreshold * 100));
        const bufferData = filteredMarkets.map(m => ((m.liquidationThreshold - m.maxLTV) * 100));

        return {
            backgroundColor: 'transparent',
            title: {
                text: 'LTV & Liquidation Thresholds',
                left: 'center',
                top: 0,
                textStyle: { color: goldColor, fontSize: 16, fontWeight: 600 }
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                borderColor: goldColor,
                textStyle: { color: textColor },
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: ['Max LTV', 'Liq. Threshold', 'Safety Buffer'],
                top: 30,
                left: 'center',
                itemGap: 25,
                textStyle: { color: textColor, fontSize: 11 }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '15%',
                top: '20%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: marketLabels,
                axisLine: { lineStyle: { color: gridColor } },
                axisLabel: { color: textColor, fontSize: 10, interval: 0 },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                name: 'Percentage',
                nameTextStyle: { color: textColor, fontSize: 11 },
                max: 100,
                axisLine: { lineStyle: { color: gridColor } },
                axisLabel: { color: textColor, fontSize: 11, formatter: '{value}%' },
                splitLine: { lineStyle: { color: gridColor, type: 'dashed' } }
            },
            series: [
                {
                    name: 'Max LTV',
                    type: 'bar',
                    data: ltvData,
                    itemStyle: { color: goldColor },
                    barGap: '10%'
                },
                {
                    name: 'Liq. Threshold',
                    type: 'bar',
                    data: thresholdData,
                    itemStyle: { color: '#FBBF24' }
                },
                {
                    name: 'Safety Buffer',
                    type: 'bar',
                    data: bufferData,
                    itemStyle: { color: '#22C55E' }
                }
            ]
        };
    }, [filteredMarkets, marketLabels]);

    // Combined Overview Chart (Radar)
    const overviewChartOptions = useMemo(() => {
        if (filteredMarkets.length === 0) return null;

        // Normalize data for radar chart (0-100 scale)
        const maxLiquidity = Math.max(...filteredMarkets.map(m => 
            m.borrowAssets.reduce((sum, a) => sum + a.availableLiquidity, 0)
        ));
        const maxAPR = Math.max(...filteredMarkets.map(m => 
            Math.max(...m.borrowAssets.map(a => a.borrowAPR))
        ));

        const radarData = filteredMarkets.map(m => {
            const liquidity = m.borrowAssets.reduce((sum, a) => sum + a.availableLiquidity, 0);
            const apr = Math.min(...m.borrowAssets.map(a => a.borrowAPR));
            const buffer = (m.liquidationThreshold - m.maxLTV) * 100;
            
            return {
                value: [
                    m.maxLTV * 100,                           // LTV (higher is better)
                    (1 - apr / maxAPR) * 100,                 // APR Score (inverted - lower APR = higher score)
                    (liquidity / maxLiquidity) * 100,         // Liquidity (normalized)
                    buffer * 5,                               // Safety Buffer (amplified)
                    m.liquidationThreshold * 100              // Threshold
                ],
                name: `${m.protocol} - ${m.chain}`,
                lineStyle: { color: protocolColors[m.protocol] },
                itemStyle: { color: protocolColors[m.protocol] },
                areaStyle: { color: protocolColors[m.protocol], opacity: 0.15 }
            };
        });

        return {
            backgroundColor: 'transparent',
            title: {
                text: 'Market Comparison Overview',
                subtext: 'Multi-dimensional comparison',
                left: 'center',
                top: 0,
                textStyle: { color: goldColor, fontSize: 16, fontWeight: 600 },
                subtextStyle: { color: textColor, fontSize: 12 }
            },
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                borderColor: goldColor,
                textStyle: { color: textColor }
            },
            legend: {
                data: filteredMarkets.map(m => `${m.protocol} - ${m.chain}`),
                top: 50,
                left: 'center',
                orient: 'horizontal',
                itemGap: 20,
                textStyle: { color: textColor, fontSize: 10 }
            },
            radar: {
                indicator: [
                    { name: 'Max LTV', max: 100 },
                    { name: 'APR Score', max: 100 },
                    { name: 'Liquidity', max: 100 },
                    { name: 'Safety', max: 100 },
                    { name: 'Threshold', max: 100 }
                ],
                center: ['50%', '65%'],
                radius: '50%',
                axisName: { color: textColor, fontSize: 11 },
                splitLine: { lineStyle: { color: gridColor } },
                splitArea: { 
                    areaStyle: { 
                        color: ['rgba(212, 175, 55, 0.02)', 'rgba(212, 175, 55, 0.05)'] 
                    } 
                },
                axisLine: { lineStyle: { color: gridColor } }
            },
            series: [{
                type: 'radar',
                data: radarData
            }]
        };
    }, [filteredMarkets]);

    if (filteredMarkets.length === 0) {
        return null;
    }

    const viewOptions = [
        { key: 'apr' as ChartView, label: 'APR', icon: TrendingDown },
        { key: 'liquidity' as ChartView, label: 'Liquidity', icon: Droplets },
        { key: 'ltv' as ChartView, label: 'LTV', icon: Shield },
        { key: 'all' as ChartView, label: 'Overview', icon: Layers }
    ];

    const getCurrentChart = () => {
        switch (activeView) {
            case 'apr': return aprChartOptions;
            case 'liquidity': return liquidityChartOptions;
            case 'ltv': return ltvChartOptions;
            case 'all': return overviewChartOptions;
            default: return aprChartOptions;
        }
    };

    return (
        <motion.div 
            className="market-charts-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="charts-header">
                <div className="charts-title">
                    <BarChart3 size={20} className="charts-icon" />
                    <h2>Market Comparison</h2>
                    <span className="charts-badge">
                        {filteredMarkets.length} Markets
                    </span>
                </div>
                
                {/* View Selector */}
                <div className="charts-controls">
                    <div className="chart-view-tabs">
                        {viewOptions.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                className={`view-tab ${activeView === key ? 'active' : ''}`}
                                onClick={() => setActiveView(key)}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Protocol Legend - hide for Overview since it has its own */}
            {activeView !== 'all' && (
                <div className="protocol-legend">
                    {Object.entries(protocolColors).map(([protocol, color]) => (
                        <div key={protocol} className="legend-item">
                            <span className="legend-color" style={{ background: color }}></span>
                            <span className="legend-label">{protocol}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="chart-container-wrapper">
                {getCurrentChart() ? (
                    <ReactECharts 
                        option={getCurrentChart()!}
                        style={{ height: activeView === 'all' ? '400px' : '320px', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                        notMerge={true}
                    />
                ) : (
                    <div className="chart-no-data">
                        <BarChart3 size={24} />
                        <span>No chart data available</span>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="chart-metrics-summary">
                <div className="metric-card">
                    <span className="metric-label">Best APR</span>
                    <span className={`metric-value ${(() => {
                        const allAPRs = filteredMarkets.flatMap(m => m.borrowAssets.map(a => a.borrowAPR)).filter(apr => apr > 0);
                        return allAPRs.length > 0 ? 'success' : 'not-listed';
                    })()}`}>
                        {(() => {
                            const allAPRs = filteredMarkets.flatMap(m => m.borrowAssets.map(a => a.borrowAPR)).filter(apr => apr > 0);
                            return allAPRs.length > 0 ? `${Math.min(...allAPRs).toFixed(2)}%` : 'Not Listed';
                        })()}
                    </span>
                </div>
                <div className="metric-card">
                    <span className="metric-label">Total Liquidity</span>
                    <span className={`metric-value ${(() => {
                        const total = filteredMarkets.reduce((sum, m) => 
                            sum + m.borrowAssets.reduce((s, a) => s + a.availableLiquidity, 0), 0);
                        return total > 0 ? '' : 'not-listed';
                    })()}`}>
                        {(() => {
                            const total = filteredMarkets.reduce((sum, m) => 
                                sum + m.borrowAssets.reduce((s, a) => s + a.availableLiquidity, 0), 0);
                            if (total <= 0) return 'Not Listed';
                            if (total >= 1000000) return `$${(total / 1000000).toFixed(2)}M`;
                            if (total >= 1000) return `$${(total / 1000).toFixed(0)}K`;
                            return `$${total.toFixed(0)}`;
                        })()}
                    </span>
                </div>
                <div className="metric-card">
                    <span className="metric-label">Highest LTV</span>
                    <span className={`metric-value ${(() => {
                        const maxLTV = Math.max(...filteredMarkets.map(m => m.maxLTV));
                        return maxLTV > 0 ? '' : 'not-listed';
                    })()}`}>
                        {(() => {
                            const maxLTV = Math.max(...filteredMarkets.map(m => m.maxLTV));
                            return maxLTV > 0 ? `${(maxLTV * 100).toFixed(0)}%` : 'Not Listed';
                        })()}
                    </span>
                </div>
                <div className="metric-card">
                    <span className="metric-label">Markets Compared</span>
                    <span className="metric-value warning">
                        {filteredMarkets.length}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
