# Technical Documentation

## Project Structure

```
gold-defi-markets/
├── src/
│   ├── types/
│   │   └── index.ts                 # Core domain types
│   ├── adapters/
│   │   ├── IProtocolAdapter.ts      # Protocol adapter interface
│   │   ├── AaveAdapter.ts           # Aave V3 implementation
│   │   ├── MorphoAdapter.ts         # Morpho Blue implementation
│   │   └── FluidAdapter.ts          # Fluid implementation
│   ├── services/
│   │   ├── MarketAggregator.ts      # Orchestrates data fetching
│   │   └── RecommendationEngine.ts  # Scoring and recommendation logic
│   ├── components/
│   │   ├── MarketCard.tsx           # Individual market display
│   │   ├── Recommendation.tsx       # Top recommendation display
│   │   └── Filters.tsx              # Filter controls
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Design system and styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Data Flow

```
User selects filters
    ↓
App.tsx triggers fetchMarkets()
    ↓
MarketAggregator.fetchAllMarkets()
    ↓
Parallel calls to all protocol adapters
    ├── AaveAdapter.fetchMarkets()
    ├── MorphoAdapter.fetchMarkets()
    └── FluidAdapter.fetchMarkets()
    ↓
Each adapter:
    1. Connects to RPC endpoint
    2. Queries protocol contracts
    3. Normalizes data to LendingMarket format
    4. Returns array of markets
    ↓
MarketAggregator aggregates all results
    ↓
App.tsx applies filters (chain, protocol)
    ↓
RecommendationEngine.analyzeMarkets()
    ├── Scores each market/borrowAsset pair
    ├── Generates reasons and warnings
    └── Sorts by score
    ↓
UI renders:
    ├── Top recommendation (Recommendation component)
    └── All markets (MarketCard components)
```

## Protocol Integration Details

### Aave V3

**Contracts Used:**
- `PoolDataProvider`: For reserve configuration and data
- `Pool`: For reserve information

**Key Functions:**
- `getReserveConfigurationData(asset)`: Returns LTV, liquidation threshold
- `getReserveData(asset)`: Returns liquidity, borrow rates

**Data Mapping:**
- LTV: Basis points → decimal (e.g., 7500 → 0.75)
- Borrow Rate: Ray (1e27) → percentage
- Liquidity: Wei → human-readable units

**Chains:**
- Ethereum: 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
- Arbitrum: 0x794a61358D6845594F94dc1DB02A252b5b4814aD
- Optimism: 0x794a61358D6845594F94dc1DB02A252b5b4814aD

### Morpho Blue

**Contracts Used:**
- `Morpho`: Core lending contract

**Key Functions:**
- `market(marketId)`: Returns market state
- `idToMarketParams(marketId)`: Returns market parameters

**Data Mapping:**
- LLTV (Liquidation LTV) → liquidationThreshold
- MaxLTV estimated as 95% of LLTV
- Borrow rate calculated from utilization

**Known Limitations:**
- Market IDs are hardcoded (should use subgraph in production)
- APR calculation is simplified (should call IRM contract)

**Chains:**
- Ethereum: 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb

### Fluid

**Contracts Used:**
- `Liquidity`: Core liquidity contract
- Individual vaults for each market

**Key Functions:**
- `getVaultVariables(vault)`: Returns vault state
- `getVaultConfig(vault)`: Returns vault configuration

**Data Mapping:**
- Vault balance → available liquidity
- Vault config → LTV and liquidation threshold

**Known Limitations:**
- Vault addresses are hardcoded (should use API/subgraph)
- APR estimation is simplified (should query vault's rate model)

**Chains:**
- Ethereum: 0x52Aa899454998Be5b000Ad077a46Bbe360F4e497

## Recommendation Algorithm

### Scoring Formula

```typescript
score = 100 (base)
  + liquidityBonus (0 to +10)
  - liquidityPenalty (0 to -40)
  + aprBonus (0 to +15)
  - aprPenalty (0 to -30)
  + safetyBonus (0 to +5)
  - safetyPenalty (0 to -25)
  + ltvBonus (0 to +5)
  - ltvPenalty (0 to -10)
  + protocolBonus (0 to +10)
  + chainBonus (0 to +5)
```

### Criteria Details

**Liquidity Scoring:**
```typescript
if (liquidity > 1M) → +10 points, reason: "Excellent liquidity"
if (liquidity > 10K) → base score, reason: "Good liquidity"
if (liquidity < 10K) → -40 points, warning: "Low liquidity"
```

**APR Scoring:**
```typescript
if (apr < 3%) → +15 points, reason: "Excellent borrow rate"
if (apr < 5%) → +5 points, reason: "Good borrow rate"
if (apr < 10%) → base score, reason: "Moderate borrow rate"
if (apr > 15%) → -30 points, warning: "High borrow rate"
```

**Safety Scoring:**
```typescript
buffer = liquidationThreshold - maxLTV
if (buffer >= 5%) → +5 points, reason: "Safe liquidation buffer"
if (buffer < 5%) → -25 points, warning: "Tight liquidation buffer"
```

**LTV Scoring:**
```typescript
if (maxLTV >= 80%) → +5 points, reason: "High capital efficiency"
if (maxLTV < 60%) → -10 points, warning: "Low capital efficiency"
```

**Protocol Scoring:**
```typescript
if (protocol === 'Aave') → +10 points, reason: "Battle-tested protocol"
if (protocol === 'Morpho') → +5 points, reason: "Efficient protocol"
```

**Chain Scoring:**
```typescript
if (chain === 'Ethereum') → +5 points, reason: "Highest security"
if (chain === 'Arbitrum') → +3 points, reason: "Lower gas fees"
```

## Performance Optimizations

### 1. Parallel Fetching
```typescript
const fetchPromises = adapters.flatMap(adapter =>
  chains.map(chain => adapter.fetchMarkets(collateral, chain))
);
const results = await Promise.all(fetchPromises);
```

All protocol/chain combinations are fetched simultaneously.

### 2. Error Isolation
```typescript
.catch(error => {
  console.error(`Error fetching from ${protocol}:`, error);
  return []; // Return empty array, don't break other fetches
})
```

One protocol failure doesn't affect others.

### 3. Minimal Re-renders
- Filters trigger re-computation, not re-fetching
- Only collateral change triggers new data fetch
- Recommendations computed from filtered data

### 4. Efficient Data Structures
- Maps for O(1) lookups (chain configs, collateral addresses)
- Arrays for iteration (markets, recommendations)
- No unnecessary data transformations

## Type Safety

All data flows through strongly-typed interfaces:

```typescript
CollateralToken → 'XAUT' | 'PAXG'
Protocol → 'Aave' | 'Morpho' | 'Fluid'
Chain → 'Ethereum' | 'Arbitrum' | 'Optimism' | 'Polygon'

LendingMarket {
  protocol: Protocol
  chain: Chain
  collateral: CollateralToken
  borrowAssets: BorrowAsset[]
  maxLTV: number
  liquidationThreshold: number
  collateralCap?: number
}
```

TypeScript ensures:
- No invalid protocol/chain combinations
- All required fields present
- Correct data types throughout

## Error Handling

### RPC Errors
- Caught at adapter level
- Logged to console
- Return empty array (don't break app)

### Missing Data
- Optional fields marked with `?`
- Graceful degradation (show what's available)
- Clear messaging to user

### Network Failures
- Error state in UI
- Retry button provided
- User-friendly error messages

## Future Enhancements

### Short Term
1. **Subgraph Integration**: Replace hardcoded market/vault IDs
2. **Historical Data**: Add APR and liquidity trends
3. **More Chains**: Add Polygon, Base, etc.
4. **More Protocols**: Add Compound, Spark, etc.

### Medium Term
1. **Caching**: Add in-memory cache with TTL
2. **WebSocket Updates**: Real-time data updates
3. **Advanced Filters**: Filter by APR range, liquidity threshold
4. **Comparison Mode**: Side-by-side market comparison

### Long Term
1. **Simulation**: Calculate borrowing scenarios
2. **Alerts**: Notify when better rates available
3. **Portfolio Tracking**: Track user positions (still read-only)
4. **Multi-Collateral**: Support non-gold tokens

## Testing Strategy

### Unit Tests
- Test each adapter independently
- Mock RPC responses
- Verify data normalization

### Integration Tests
- Test MarketAggregator with multiple adapters
- Verify parallel fetching
- Test error handling

### E2E Tests
- Test full user flow
- Verify UI updates correctly
- Test filter interactions

### Manual Testing Checklist
- [ ] All protocols load data
- [ ] Filters work correctly
- [ ] Recommendations make sense
- [ ] Error states display properly
- [ ] Responsive on mobile
- [ ] Performance is acceptable

## Deployment Considerations

### Environment Variables
```env
VITE_ETHEREUM_RPC=https://eth.llamarpc.com
VITE_ARBITRUM_RPC=https://arbitrum.llamarpc.com
VITE_OPTIMISM_RPC=https://optimism.llamarpc.com
```

### Build Optimization
```bash
npm run build
# Output: dist/
# Optimized, minified, tree-shaken
```

### Hosting Options
- **Vercel**: Zero-config deployment
- **Netlify**: Easy CI/CD
- **GitHub Pages**: Free static hosting
- **IPFS**: Decentralized hosting

### Monitoring
- Track RPC call failures
- Monitor page load times
- Log recommendation scores
- Track user filter preferences

## Code Quality

### Linting
- ESLint configured
- TypeScript strict mode
- No unused variables
- Consistent formatting

### Documentation
- JSDoc comments on key functions
- README with architecture overview
- Inline comments for complex logic
- Type definitions as documentation

### Maintainability
- Single Responsibility Principle
- Dependency Injection (adapters)
- Clear separation of concerns
- Minimal coupling between modules
