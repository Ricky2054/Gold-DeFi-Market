import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketAggregator } from './services/MarketAggregator';
import { RecommendationEngine } from './services/RecommendationEngine';
import type { LendingMarket, CollateralToken, Chain, Protocol, MarketRecommendation } from './types';
import { MarketCard } from './components/MarketCard';
import { Recommendation } from './components/Recommendation';
import { Filters } from './components/Filters';
import { Glossary } from './components/Glossary';
import { Button, MarketGridSkeleton, RecommendationSkeleton, BlurText } from './components/ui';
import BlobCursor from './components/ui/BlobCursor';
import FloatingLines from './components/ui/FloatingLines';
import { config, validateConfig } from './config/env';
import { RefreshCw, Clock, Shield, Zap, BookOpen, ExternalLink, AlertCircle, Inbox, Trophy, BarChart3, Ghost, Hexagon, Droplets } from 'lucide-react';
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
    const fetchStartTime = new Date();
    console.log('🔄 [RAC] Starting real-time data fetch at:', fetchStartTime.toLocaleTimeString());
    console.log('🔄 [RAC] Fetching data for collateral:', selectedCollateral);

    try {
      const fetchedMarkets = await aggregator.fetchAllMarkets(selectedCollateral);
      const fetchEndTime = new Date();
      const fetchDuration = fetchEndTime.getTime() - fetchStartTime.getTime();

      console.log('✅ [RAC] Data fetch completed at:', fetchEndTime.toLocaleTimeString());
      console.log('✅ [RAC] Fetch duration:', fetchDuration, 'ms');
      console.log('✅ [RAC] Markets fetched:', fetchedMarkets.length);
      console.log('✅ [RAC] Market details:', fetchedMarkets);

      setMarkets(fetchedMarkets);
      setLastFetchTime(fetchEndTime);
    } catch (err) {
      console.error('❌ [RAC] Error fetching markets:', err);
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
      {/* Floating Lines Background */}
      <div className="floating-lines-bg">
        <FloatingLines
          linesGradient={['#D4AF37', '#8B6D1E', '#D4AF37']}
          enabledWaves={['top', 'bottom']}
          lineCount={[5, 4]}
          lineDistance={[8, 6]}
          animationSpeed={0.5}
          interactive={false}
          bendRadius={3.0}
          bendStrength={-0.3}
          parallax={false}
          parallaxStrength={0.1}
          mixBlendMode="normal"
        />
      </div>

      {/* Blob Cursor Animation */}
      <BlobCursor
        blobType="circle"
        fillColor="#D4AF37"
        trailCount={3}
        sizes={[30, 60, 40]}
        innerSizes={[8, 16, 10]}
        innerColor="rgba(255,255,255,0.9)"
        opacities={[0.4, 0.3, 0.2]}
        shadowColor="rgba(212, 175, 55, 0.4)"
        shadowBlur={10}
        useFilter={true}
        filterStdDeviation={25}
        fastDuration={0.08}
        slowDuration={0.4}
      />
      
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

      {/* Hero Section - Educational for Web2 users */}
      <section className="hero-section">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badges">
              <div className="hero-badge">
                <Shield size={16} />
                <span>No Wallet Required</span>
              </div>
              <div className="hero-badge">
                <Zap size={16} />
                <span>Real-Time Data</span>
              </div>
              <div className="hero-badge">
                <BookOpen size={16} />
                <span>Beginner Friendly</span>
              </div>
            </div>
            <BlurText
              text="Find the Best Rates to Borrow Against Your Gold"
              delay={80}
              animateBy="words"
              direction="top"
              className="hero-title"
              stepDuration={0.4}
            />
            <p className="hero-description">
              This dashboard helps you compare lending rates across multiple DeFi protocols. 
              <strong> You can use your gold-backed tokens (XAUT or PAXG) as collateral</strong> to borrow stablecoins 
              or other cryptocurrencies at competitive rates. Think of it like a pawn shop, but on the blockchain!
            </p>
            <div className="hero-cta">
              <a href="https://docs.aave.com/faq/" target="_blank" rel="noopener noreferrer" className="learn-link">
                <BookOpen size={14} />
                Learn about DeFi Lending
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="main-content">
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
          <AnimatePresence mode="wait">
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
                exit={{ opacity: 0 }}
              >
                {/* Recommendation */}
                {recommendations.length > 0 && (
                  <Recommendation recommendation={recommendations[0]} />
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
          </AnimatePresence>
        </div>
      </main>

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
