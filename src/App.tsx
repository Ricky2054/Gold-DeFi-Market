import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MarketAggregator } from './services/MarketAggregator';
import { RecommendationEngine } from './services/RecommendationEngine';
import type { LendingMarket, CollateralToken, Chain, Protocol, MarketRecommendation } from './types';
import { MarketCard } from './components/MarketCard';
import { MarketDetailModal } from './components/MarketDetailModal';
import { MarketCharts } from './components/MarketCharts';
import { Recommendation } from './components/Recommendation';
import { Filters } from './components/Filters';
import { Glossary } from './components/Glossary';
import { Button, MarketGridSkeleton, RecommendationSkeleton } from './components/ui';
import { config, validateConfig } from './config/env';
import { RefreshCw, Clock, Shield, AlertCircle, Inbox, Trophy, BarChart3, Ghost, Hexagon, Droplets, ChevronDown } from 'lucide-react';
import './index.css';

function App() {
  const [markets, setMarkets] = useState<LendingMarket[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<LendingMarket[]>([]);
  const [recommendations, setRecommendations] = useState<MarketRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter states
  const [selectedCollateral, setSelectedCollateral] = useState<CollateralToken>(config.app.defaultCollateral);
  const [selectedChain, setSelectedChain] = useState<Chain | 'All'>('All');
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | 'All'>('All');

  // Modal state
  const [selectedMarket, setSelectedMarket] = useState<LendingMarket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openMarketDetail = (market: LendingMarket) => {
    setSelectedMarket(market);
    setIsModalOpen(true);
  };

  const closeMarketDetail = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMarket(null), 300);
  };

  const mainContentRef = useRef<HTMLElement>(null);

  const scrollToContent = () => {
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const aggregator = new MarketAggregator();
  const recommendationEngine = new RecommendationEngine();

  // Validate configuration on mount
  useEffect(() => {
    validateConfig();
  }, []);

  // Fetch markets on mount and when collateral changes
  useEffect(() => {
    fetchMarkets();
  }, [selectedCollateral]);

  // Filter markets when filters change
  useEffect(() => {
    applyFilters();
  }, [markets, selectedChain, selectedProtocol]);

  const fetchMarkets = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const fetchedMarkets = await aggregator.fetchAllMarkets(selectedCollateral);
      const fetchEndTime = new Date();

      setMarkets(fetchedMarkets);
      setLastFetchTime(fetchEndTime);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError('Failed to fetch market data. Please try again later.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...markets];

    if (selectedChain !== 'All') {
      filtered = filtered.filter((m) => m.chain === selectedChain);
    }

    if (selectedProtocol !== 'All') {
      filtered = filtered.filter((m) => m.protocol === selectedProtocol);
    }

    setFilteredMarkets(filtered);

    // Generate recommendations
    if (filtered.length > 0) {
      const recs = recommendationEngine.analyzeMarkets(filtered);
      setRecommendations(recs);
    } else {
      setRecommendations([]);
    }
  };

  const handleCollateralChange = (collateral: CollateralToken) => {
    setSelectedCollateral(collateral);
    setSelectedChain('All');
    setSelectedProtocol('All');
  };

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <motion.div
                className="logo-icon-wrapper"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Trophy size={32} className="logo-icon" />
              </motion.div>
              <div className="logo-text">
                <h1>Gold DeFi Markets</h1>
                <p className="subtitle">
                  Compare borrowing rates across DeFi protocols using gold-backed tokens
                </p>
              </div>
            </div>
            <div className="header-actions">
              {lastFetchTime && (
                <div className="live-indicator">
                  <span className="live-dot"></span>
                  <Clock size={14} />
                  <span>Updated {lastFetchTime.toLocaleTimeString()}</span>
                </div>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={<RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />}
                onClick={() => fetchMarkets(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full viewport, minimal copy */}
      <section className="hero-section-full">
        <div className="hero-content-centered">
          <motion.div
            className="hero-badge-minimal"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Trophy size={20} />
            <span>Gold DeFi Markets</span>
          </motion.div>
          
          <motion.h1 
            className="hero-headline"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Compare Gold-Backed
            <br />
            <span className="gold-gradient">DeFi Borrowing Markets</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Real-time rates across Aave, Morpho & Fluid — No wallet required
          </motion.p>

          <motion.div
            className="hero-cta-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToContent}
            >
              View Markets
            </Button>
            {lastFetchTime && (
              <div className="hero-live-indicator">
                <span className="live-dot"></span>
                <Clock size={14} />
                <span>Live • Updated {lastFetchTime.toLocaleTimeString()}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.2, duration: 0.6 },
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
          onClick={scrollToContent}
        >
          <span>Scroll to explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      <main className="main-content" ref={mainContentRef}>
        <div className="container">
          {/* Filters */}
          <Filters
            selectedCollateral={selectedCollateral}
            selectedChain={selectedChain}
            selectedProtocol={selectedProtocol}
            availableChains={aggregator.getSupportedChains()}
            availableProtocols={aggregator.getProtocols()}
            onCollateralChange={handleCollateralChange}
            onChainChange={setSelectedChain}
            onProtocolChange={setSelectedProtocol}
          />

          {/* Loading State */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RecommendationSkeleton />
              <h2 className="section-title mb-lg">
                <BarChart3 size={20} className="section-icon" />
                Loading Markets...
              </h2>
              <MarketGridSkeleton count={6} />
            </motion.div>
          )}

          {/* Error State */}
          {!loading && error && (
            <motion.div
              key="error"
              className="error-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="error-icon">
                <AlertCircle size={48} />
              </div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <Button
                variant="primary"
                icon={<RefreshCw size={16} />}
                onClick={() => fetchMarkets(false)}
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Success State */}
          {!loading && !error && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Recommendation */}
              {recommendations.length > 0 && (
                <Recommendation recommendation={recommendations[0]} />
              )}

              {/* Market Analytics Charts */}
              {filteredMarkets.length > 0 && (
                <MarketCharts
                  markets={filteredMarkets}
                  selectedCollateral={selectedCollateral}
                  selectedProtocol={selectedProtocol}
                  selectedChain={selectedChain}
                />
              )}

                {/* Markets Grid */}
                {filteredMarkets.length > 0 ? (
                  <>
                    <div className="section-header">
                      <h2 className="section-title">
                        <BarChart3 size={20} className="section-icon" />
                        All Markets
                        <span className="section-count">{filteredMarkets.length}</span>
                      </h2>
                      <p className="section-description">
                        Browse all available lending markets matching your filters
                      </p>
                    </div>
                    <div className="markets-grid">
                      {filteredMarkets.map((market, index) => (
                        <MarketCard
                          key={`${market.protocol}-${market.chain}-${market.collateral}-${index}`}
                          market={market}
                          index={index}
                          onClick={() => openMarketDetail(market)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <motion.div
                    className="empty-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="empty-icon">
                      <Inbox size={48} />
                    </div>
                    <h3>No Markets Found</h3>
                    <p>Try adjusting your filters or selecting a different collateral token.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedChain('All');
                        setSelectedProtocol('All');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
        </div>
      </main>

      {/* Market Detail Modal */}
      <MarketDetailModal
        market={selectedMarket}
        isOpen={isModalOpen}
        onClose={closeMarketDetail}
      />

      {/* Glossary for Web2 Users */}
      <Glossary />

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-main">
              <p className="footer-title">
                <Shield size={16} />
                Read-Only Analytics Dashboard
              </p>
              <p className="footer-subtitle">
                No wallet connection required • Data fetched directly from blockchain
              </p>
            </div>
            <div className="footer-protocols">
              <span>Powered by:</span>
              <div className="protocol-list">
                <span className="protocol-item"><Ghost size={14} /> Aave V3</span>
                <span className="protocol-item"><Hexagon size={14} /> Morpho Blue</span>
                <span className="protocol-item"><Droplets size={14} /> Fluid</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
