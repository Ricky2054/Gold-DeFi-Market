# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Update RPC Endpoints

Replace public RPC endpoints with dedicated providers for better reliability and performance.

**Recommended Providers:**
- [Alchemy](https://www.alchemy.com/)
- [Infura](https://www.infura.io/)
- [QuickNode](https://www.quicknode.com/)

**Update in adapters:**

```typescript
// src/adapters/AaveAdapter.ts
private chainConfigs: Map<Chain, ChainConfig> = new Map([
  [
    'Ethereum',
    {
      rpcUrl: import.meta.env.VITE_ETHEREUM_RPC || 'https://eth.llamarpc.com',
      // ... rest of config
    },
  ],
]);
```

**Create `.env` file:**

```env
VITE_ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
VITE_ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY
VITE_OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 2. Update Market/Vault Discovery

**For Morpho:**

Replace hardcoded market IDs with subgraph queries:

```typescript
// Install GraphQL client
npm install graphql-request

// src/adapters/MorphoAdapter.ts
import { request, gql } from 'graphql-request';

const MORPHO_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/morpho-org/morpho-blue';

const MARKETS_QUERY = gql`
  query GetMarkets($collateral: String!) {
    markets(where: { collateralToken: $collateral }) {
      id
      lltv
      collateralToken
      loanToken
      totalSupplyAssets
      totalBorrowAssets
    }
  }
`;

async fetchMarkets(collateral: CollateralToken, chain: Chain): Promise<LendingMarket[]> {
  const collateralAddress = this.getCollateralAddress(collateral, chain);
  const data = await request(MORPHO_SUBGRAPH, MARKETS_QUERY, {
    collateral: collateralAddress.toLowerCase()
  });
  // Process data...
}
```

**For Fluid:**

Use Fluid's API or subgraph to discover vaults dynamically.

### 3. Improve APR Calculations

**For Morpho:**

Call the actual Interest Rate Model (IRM) contract:

```typescript
const irmContract = new ethers.Contract(irmAddress, MORPHO_IRM_ABI, provider);
const borrowRate = await irmContract.borrowRateView(
  marketId,
  totalBorrowAssets,
  totalSupplyAssets
);
const borrowAPR = Number(borrowRate) / 1e16; // Convert to percentage
```

**For Fluid:**

Query the vault's interest rate strategy contract.

### 4. Add Caching Layer

Implement caching to reduce RPC calls and improve performance:

```typescript
// src/services/CacheService.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }
}

// Usage in adapters
const cacheKey = `aave-${collateral}-${chain}`;
const cached = this.cache.get<LendingMarket[]>(cacheKey);
if (cached) return cached;

const markets = await this.fetchFromChain(collateral, chain);
this.cache.set(cacheKey, markets, 60); // Cache for 60 seconds
return markets;
```

### 5. Add Error Tracking

Install Sentry or similar for production error tracking:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### 6. Add Analytics

Track user interactions and performance:

```bash
npm install @vercel/analytics
```

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
);
```

## Build for Production

```bash
# Install dependencies
npm install

# Run type check
npm run build

# Preview production build locally
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Steps:**

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

**vercel.json:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_ETHEREUM_RPC": "@ethereum-rpc",
    "VITE_ARBITRUM_RPC": "@arbitrum-rpc",
    "VITE_OPTIMISM_RPC": "@optimism-rpc"
  }
}
```

**Benefits:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Preview deployments for PRs

### Option 2: Netlify

**Steps:**

1. Connect GitHub repository
2. Configure build settings
3. Add environment variables
4. Deploy

**netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: GitHub Pages

**Steps:**

1. Install gh-pages: `npm install -D gh-pages`
2. Update package.json:

```json
{
  "homepage": "https://yourusername.github.io/gold-defi-markets",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update vite.config.ts:

```typescript
export default defineConfig({
  base: '/gold-defi-markets/',
  plugins: [react()],
});
```

4. Deploy: `npm run deploy`

### Option 4: IPFS (Decentralized)

**Steps:**

1. Build: `npm run build`
2. Upload to IPFS:

```bash
# Using Pinata
npx pinata-upload-cli dist/

# Or using IPFS Desktop
# Drag and drop dist/ folder
```

3. Access via IPFS gateway:
   - `https://ipfs.io/ipfs/YOUR_HASH`
   - `https://gateway.pinata.cloud/ipfs/YOUR_HASH`

## Performance Optimization

### 1. Code Splitting

Vite handles this automatically, but you can optimize further:

```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./components/HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### 2. Bundle Analysis

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }),
  ],
});
```

### 3. Image Optimization

If adding images/logos:

```bash
npm install -D vite-plugin-imagemin
```

### 4. Compression

Enable gzip/brotli compression on your hosting platform.

## Security Considerations

### 1. Content Security Policy

Add CSP headers to prevent XSS:

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               connect-src 'self' https://*.llamarpc.com https://*.alchemy.com;">
```

### 2. Environment Variables

Never commit `.env` files. Use platform-specific secret management.

### 3. Dependency Auditing

```bash
npm audit
npm audit fix
```

### 4. HTTPS Only

Ensure your deployment platform serves over HTTPS (most do by default).

## Monitoring & Maintenance

### 1. Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### 2. Performance Monitoring

Track Core Web Vitals:
- Lighthouse CI
- WebPageTest
- Chrome User Experience Report

### 3. RPC Health Checks

Monitor RPC endpoint availability and latency:

```typescript
// src/services/HealthCheck.ts
export async function checkRPCHealth(rpcUrl: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    await provider.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}
```

### 4. Regular Updates

- Update dependencies monthly: `npm update`
- Check for security vulnerabilities: `npm audit`
- Monitor protocol contract changes
- Update market/vault addresses as needed

## Scaling Considerations

### 1. Rate Limiting

Implement client-side rate limiting for RPC calls:

```typescript
// src/utils/rateLimiter.ts
export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerSecond: number;

  constructor(requestsPerSecond: number = 10) {
    this.requestsPerSecond = requestsPerSecond;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const fn = this.queue.shift()!;
    await fn();
    
    setTimeout(() => {
      this.processing = false;
      this.processQueue();
    }, 1000 / this.requestsPerSecond);
  }
}
```

### 2. Backend API (Optional)

For very high traffic, consider adding a backend:

```typescript
// Backend caches RPC responses
// Frontend calls backend instead of RPC directly
const response = await fetch('https://api.yourapp.com/markets/XAUT');
const markets = await response.json();
```

### 3. CDN for Static Assets

Use CDN for fonts, images, and static files.

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### RPC Errors in Production

- Check RPC endpoint health
- Verify API keys are set correctly
- Check rate limits
- Try fallback RPC endpoints

### Slow Load Times

- Enable compression
- Optimize bundle size
- Use CDN
- Implement caching

### Type Errors

```bash
# Regenerate types
npm run build
# Check tsconfig.json settings
```

## Rollback Plan

1. Keep previous deployment available
2. Use platform's rollback feature (Vercel/Netlify)
3. Or redeploy previous git commit:

```bash
git checkout <previous-commit>
npm run deploy
```

## Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] Data fetches successfully
- [ ] Filters work as expected
- [ ] Recommendations display properly
- [ ] Mobile responsive
- [ ] Error states work
- [ ] Analytics tracking
- [ ] Error tracking configured
- [ ] Performance metrics acceptable
- [ ] SEO meta tags present
- [ ] HTTPS enabled
- [ ] Monitoring set up

## Support & Maintenance

### Regular Tasks

**Daily:**
- Monitor error tracking dashboard
- Check uptime status

**Weekly:**
- Review analytics
- Check for protocol updates

**Monthly:**
- Update dependencies
- Review and optimize performance
- Update market/vault addresses if needed

**Quarterly:**
- Security audit
- Performance review
- Feature planning

---

**Ready for Production!** 🚀

Follow this guide to deploy a robust, performant, and maintainable DeFi analytics dashboard.
