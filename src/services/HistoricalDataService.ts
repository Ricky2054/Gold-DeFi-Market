/**
 * Historical Data Service
 * 
 * Fetches historical market data from protocol subgraphs and APIs.
 * 
 * Data Sources:
 * - Aave: TheGraph Aave V3 subgraphs
 * - Morpho: Morpho API (limited historical data)
 * - Fluid: No public historical API available
 * 
 * IMPORTANT: This service only returns real data from protocols.
 * When historical data is unavailable, it returns null with a clear message.
 * No data is fabricated or interpolated.
 */

import type { Protocol, Chain, CollateralToken } from '../types';

export interface HistoricalDataPoint {
    timestamp: number;
    date: string;
    borrowAPR: number;
    supplyAPR?: number;
    availableLiquidity?: number;
    totalBorrowed?: number;
    utilizationRate?: number;
}

export interface OHLCDataPoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface HistoricalDataResult {
    data: HistoricalDataPoint[] | null;
    ohlcData: OHLCDataPoint[] | null;
    available: boolean;
    source: string;
    message: string;
    lastUpdated: Date | null;
}

// Aave V3 Subgraph endpoints
const AAVE_SUBGRAPHS: Record<Chain, string> = {
    'Ethereum': 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3',
    'Arbitrum': 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum',
    'Optimism': 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism',
    'Polygon': 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-polygon',
};

// Token addresses for gold assets on different chains
const GOLD_TOKEN_ADDRESSES: Record<CollateralToken, Record<Chain, string | null>> = {
    'XAUT': {
        'Ethereum': '0x68749665FF8D2d112Fa859AA293F07A622782F38',
        'Arbitrum': null,
        'Optimism': null,
        'Polygon': null,
    },
    'PAXG': {
        'Ethereum': '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
        'Arbitrum': null,
        'Optimism': null,
        'Polygon': null,
    },
};

export class HistoricalDataService {
    private cache: Map<string, { data: HistoricalDataResult; expiry: number }> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Get historical data for a specific market
     */
    async getHistoricalData(
        protocol: Protocol,
        chain: Chain,
        collateral: CollateralToken,
        asset: string,
        days: number = 30
    ): Promise<HistoricalDataResult> {
        const cacheKey = `${protocol}-${chain}-${collateral}-${asset}-${days}`;
        
        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }

        let result: HistoricalDataResult;

        switch (protocol) {
            case 'Aave':
                result = await this.fetchAaveHistoricalData(chain, collateral, days);
                break;
            case 'Morpho':
                result = await this.fetchMorphoHistoricalData();
                break;
            case 'Fluid':
                result = this.getFluidHistoricalData();
                break;
            default:
                result = {
                    data: null,
                    ohlcData: null,
                    available: false,
                    source: 'N/A',
                    message: 'Unknown protocol',
                    lastUpdated: null,
                };
        }

        // Cache the result
        this.cache.set(cacheKey, { data: result, expiry: Date.now() + this.CACHE_DURATION });

        return result;
    }

    /**
     * Fetch historical data from Aave V3 subgraph
     */
    private async fetchAaveHistoricalData(
        chain: Chain,
        collateral: CollateralToken,
        days: number
    ): Promise<HistoricalDataResult> {
        const subgraphUrl = AAVE_SUBGRAPHS[chain];
        
        if (!subgraphUrl) {
            return {
                data: null,
                ohlcData: null,
                available: false,
                source: 'Aave V3 Subgraph',
                message: `No Aave V3 subgraph available for ${chain}`,
                lastUpdated: null,
            };
        }

        const tokenAddress = GOLD_TOKEN_ADDRESSES[collateral]?.[chain];
        
        if (!tokenAddress) {
            return {
                data: null,
                ohlcData: null,
                available: false,
                source: 'Aave V3 Subgraph',
                message: `${collateral} is not available on Aave ${chain}`,
                lastUpdated: null,
            };
        }

        try {
            const fromTimestamp = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
            
            // Query for reserve paramsHistory
            const query = `
                {
                    reserve(id: "${tokenAddress.toLowerCase()}") {
                        symbol
                        name
                        paramsHistory(
                            first: 100,
                            orderBy: timestamp,
                            orderDirection: desc,
                            where: { timestamp_gte: ${fromTimestamp} }
                        ) {
                            timestamp
                            variableBorrowRate
                            stableBorrowRate
                            liquidityRate
                            availableLiquidity
                            totalCurrentVariableDebt
                            utilizationRate
                        }
                    }
                }
            `;

            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Subgraph request failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.errors || !result.data?.reserve?.paramsHistory) {
                return {
                    data: null,
                    ohlcData: null,
                    available: false,
                    source: 'Aave V3 Subgraph',
                    message: 'Historical data not indexed for this asset',
                    lastUpdated: null,
                };
            }

            const history = result.data.reserve.paramsHistory;
            
            if (history.length === 0) {
                return {
                    data: null,
                    ohlcData: null,
                    available: false,
                    source: 'Aave V3 Subgraph',
                    message: `No historical data available for ${collateral} in the last ${days} days`,
                    lastUpdated: null,
                };
            }

            // Convert to our format (rates are in RAY - 27 decimals)
            const RAY = 1e27;
            const data: HistoricalDataPoint[] = history.map((h: any) => ({
                timestamp: parseInt(h.timestamp) * 1000,
                date: new Date(parseInt(h.timestamp) * 1000).toISOString().split('T')[0],
                borrowAPR: (parseFloat(h.variableBorrowRate) / RAY) * 100,
                supplyAPR: (parseFloat(h.liquidityRate) / RAY) * 100,
                availableLiquidity: parseFloat(h.availableLiquidity) / 1e18,
                totalBorrowed: parseFloat(h.totalCurrentVariableDebt) / 1e18,
                utilizationRate: parseFloat(h.utilizationRate) / 1e27,
            })).reverse();

            // Generate OHLC data from daily data points
            const ohlcData = this.generateOHLCFromHistory(data);

            return {
                data,
                ohlcData,
                available: true,
                source: 'Aave V3 Subgraph (TheGraph)',
                message: `${data.length} data points from the last ${days} days`,
                lastUpdated: new Date(),
            };
        } catch (error) {
            console.error('Aave historical data fetch error:', error);
            return {
                data: null,
                ohlcData: null,
                available: false,
                source: 'Aave V3 Subgraph',
                message: 'Failed to fetch historical data from subgraph',
                lastUpdated: null,
            };
        }
    }

    /**
     * Fetch historical data from Morpho API
     */
    private async fetchMorphoHistoricalData(): Promise<HistoricalDataResult> {
        // Morpho Blue doesn't have a public historical data API
        // Their data is available through their own analytics dashboard
        // but not exposed via public API endpoints
        
        return {
            data: null,
            ohlcData: null,
            available: false,
            source: 'Morpho API',
            message: 'Historical data API not publicly available. Visit app.morpho.org for analytics.',
            lastUpdated: null,
        };
    }

    /**
     * Fluid historical data status
     */
    private getFluidHistoricalData(): HistoricalDataResult {
        return {
            data: null,
            ohlcData: null,
            available: false,
            source: 'Fluid Protocol',
            message: 'Historical data not available. Fluid is a newer protocol without historical indexing.',
            lastUpdated: null,
        };
    }

    /**
     * Generate OHLC data from historical data points
     * Groups by day and calculates open/high/low/close
     */
    private generateOHLCFromHistory(data: HistoricalDataPoint[]): OHLCDataPoint[] | null {
        if (data.length < 2) return null;

        // Group by day
        const dailyData: Map<string, HistoricalDataPoint[]> = new Map();
        
        data.forEach(point => {
            const day = point.date;
            if (!dailyData.has(day)) {
                dailyData.set(day, []);
            }
            dailyData.get(day)!.push(point);
        });

        // Generate OHLC for each day
        const ohlc: OHLCDataPoint[] = [];
        
        dailyData.forEach((points, day) => {
            if (points.length === 0) return;
            
            const rates = points.map(p => p.borrowAPR);
            const timestamp = new Date(day).getTime() / 1000;
            
            ohlc.push({
                time: timestamp,
                open: rates[0],
                high: Math.max(...rates),
                low: Math.min(...rates),
                close: rates[rates.length - 1],
            });
        });

        return ohlc.length > 0 ? ohlc : null;
    }

    /**
     * Get current snapshot data for chart display
     * This uses live data and indicates no historical trend
     */
    async getCurrentSnapshot(
        borrowAPR: number,
        liquidity: number
    ): Promise<HistoricalDataResult> {
        const now = new Date();
        const currentPoint: HistoricalDataPoint = {
            timestamp: now.getTime(),
            date: now.toISOString().split('T')[0],
            borrowAPR,
            availableLiquidity: liquidity,
        };

        return {
            data: [currentPoint],
            ohlcData: null,
            available: false,
            source: 'Live Data',
            message: 'Showing current rates only. Historical trends require subgraph indexing.',
            lastUpdated: now,
        };
    }
}

export const historicalDataService = new HistoricalDataService();
