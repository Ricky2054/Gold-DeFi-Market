# Environment Configuration Guide

## Overview

All configuration values (RPC URLs, contract addresses, API keys) have been moved to environment variables for better security, flexibility, and maintainability.

---

## 📁 Files Structure

```
.env.example        # Template with all available variables (commit to git)
.env                # Your actual configuration (DO NOT commit)
src/config/env.ts   # Configuration loader with type safety
```

---

## 🚀 Quick Start

### 1. Create Your Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
# The default values work out of the box for testing
```

### 2. Customize Your Configuration

Edit `.env` and update any values you want to change:

```bash
# Use your own RPC endpoints for better performance
VITE_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
VITE_ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Adjust application settings
VITE_MIN_LIQUIDITY=50000
VITE_MAX_APR=12
```

---

## 📋 Available Environment Variables

### RPC Endpoints

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_ETHEREUM_RPC_URL` | Ethereum mainnet RPC | `https://eth.llamarpc.com` |
| `VITE_ARBITRUM_RPC_URL` | Arbitrum One RPC | `https://arbitrum.llamarpc.com` |
| `VITE_OPTIMISM_RPC_URL` | Optimism RPC | `https://optimism.llamarpc.com` |

**Recommended Providers:**
- [Alchemy](https://www.alchemy.com/) - Free tier: 300M compute units/month
- [Infura](https://infura.io/) - Free tier: 100k requests/day
- [QuickNode](https://www.quicknode.com/) - Free tier available
- [Ankr](https://www.ankr.com/) - Free public endpoints

### Aave V3 Contracts

| Variable | Description |
|----------|-------------|
| `VITE_AAVE_POOL_ETHEREUM` | Aave V3 Pool (Ethereum) |
| `VITE_AAVE_DATA_PROVIDER_ETHEREUM` | Aave V3 Data Provider (Ethereum) |
| `VITE_AAVE_POOL_ARBITRUM` | Aave V3 Pool (Arbitrum) |
| `VITE_AAVE_DATA_PROVIDER_ARBITRUM` | Aave V3 Data Provider (Arbitrum) |
| `VITE_AAVE_POOL_OPTIMISM` | Aave V3 Pool (Optimism) |
| `VITE_AAVE_DATA_PROVIDER_OPTIMISM` | Aave V3 Data Provider (Optimism) |

### Morpho Blue Contracts

| Variable | Description |
|----------|-------------|
| `VITE_MORPHO_BLUE_ETHEREUM` | Morpho Blue core contract (Ethereum) |

### Fluid Contracts

| Variable | Description |
|----------|-------------|
| `VITE_FLUID_LIQUIDITY_ETHEREUM` | Fluid Liquidity contract (Ethereum) |

### Token Addresses

**Collateral Tokens:**
- `VITE_XAUT_ETHEREUM` - Tether Gold (Ethereum)
- `VITE_XAUT_ARBITRUM` - Tether Gold (Arbitrum)
- `VITE_PAXG_ETHEREUM` - Paxos Gold (Ethereum)
- `VITE_PAXG_ARBITRUM` - Paxos Gold (Arbitrum)

**Borrow Assets (Ethereum):**
- `VITE_USDC_ETHEREUM`
- `VITE_USDT_ETHEREUM`
- `VITE_DAI_ETHEREUM`
- `VITE_WETH_ETHEREUM`

**Borrow Assets (Arbitrum):**
- `VITE_USDC_ARBITRUM`
- `VITE_USDT_ARBITRUM`
- `VITE_DAI_ARBITRUM`
- `VITE_WETH_ARBITRUM`

### Application Settings

| Variable | Description | Default | Type |
|----------|-------------|---------|------|
| `VITE_DEBUG_MODE` | Enable debug logging | `true` | boolean |
| `VITE_DEFAULT_COLLATERAL` | Default collateral token | `XAUT` | XAUT\|PAXG |
| `VITE_MIN_LIQUIDITY` | Minimum liquidity threshold (USD) | `10000` | number |
| `VITE_MAX_APR` | Maximum acceptable APR (%) | `15` | number |
| `VITE_MIN_LIQUIDATION_BUFFER` | Minimum liquidation buffer | `0.05` | number (decimal) |

---

## 🔒 Security Best Practices

### 1. Never Commit .env Files

The `.env` file is already in `.gitignore`. **Never remove it from there!**

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### 2. Use .env.example as Template

- ✅ Commit `.env.example` with placeholder values
- ✅ Update `.env.example` when adding new variables
- ❌ Never put real API keys in `.env.example`

### 3. Rotate API Keys Regularly

If you're using paid RPC providers:
- Rotate API keys every 90 days
- Use separate keys for development and production
- Monitor usage to detect unauthorized access

### 4. Use Environment-Specific Files

For different environments:

```bash
.env.development    # Development settings
.env.staging        # Staging settings
.env.production     # Production settings
```

---

## 🛠️ Usage in Code

### Accessing Configuration

```typescript
import { config } from './config/env';

// RPC URLs
const ethRpc = config.rpc.ethereum;

// Contract addresses
const aaveDataProvider = config.aave.ethereum.dataProvider;

// Token addresses
const xautAddress = config.collateral.xaut.ethereum;

// App settings
const minLiquidity = config.app.minLiquidity;
```

### Type Safety

The configuration is fully typed:

```typescript
interface EnvConfig {
  rpc: {
    ethereum: string;
    arbitrum: string;
    optimism: string;
  };
  aave: { ... };
  morpho: { ... };
  fluid: { ... };
  collateral: { ... };
  borrowAssets: { ... };
  app: {
    debugMode: boolean;
    defaultCollateral: 'XAUT' | 'PAXG';
    minLiquidity: number;
    maxAPR: number;
    minLiquidationBuffer: number;
  };
}
```

### Validation

Configuration is automatically validated on app startup:

```typescript
import { validateConfig } from './config/env';

// In App.tsx
useEffect(() => {
  validateConfig();
}, []);
```

---

## 🔄 Migration from Hardcoded Values

All adapters have been updated to use environment configuration:

### Before:
```typescript
const rpcUrl = 'https://eth.llamarpc.com';
const dataProvider = '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3';
```

### After:
```typescript
import { config } from '../config/env';

const rpcUrl = config.rpc.ethereum;
const dataProvider = config.aave.ethereum.dataProvider;
```

---

## 📝 Adding New Environment Variables

### 1. Add to .env.example

```bash
# New Feature
VITE_NEW_FEATURE_URL=https://example.com
VITE_NEW_FEATURE_API_KEY=your_api_key_here
```

### 2. Add to .env

```bash
VITE_NEW_FEATURE_URL=https://api.example.com
VITE_NEW_FEATURE_API_KEY=actual_key_123
```

### 3. Update src/config/env.ts

```typescript
export const config = {
  // ... existing config
  newFeature: {
    url: getEnvVar('VITE_NEW_FEATURE_URL', 'https://example.com'),
    apiKey: getEnvVar('VITE_NEW_FEATURE_API_KEY'),
  },
};
```

### 4. Update TypeScript Interface

```typescript
interface EnvConfig {
  // ... existing interface
  newFeature: {
    url: string;
    apiKey: string;
  };
}
```

---

## 🧪 Testing

### Local Development

```bash
# Use default values
npm run dev

# Or customize in .env
VITE_DEBUG_MODE=true
VITE_MIN_LIQUIDITY=5000
```

### Production Build

```bash
# Build with production environment
npm run build

# Preview production build
npm run preview
```

---

## ⚠️ Troubleshooting

### Variables Not Loading

**Problem:** Environment variables are `undefined`

**Solutions:**
1. Ensure variable names start with `VITE_`
2. Restart dev server after changing `.env`
3. Check `.env` file is in project root
4. Verify no syntax errors in `.env`

### Build Errors

**Problem:** TypeScript errors about missing config

**Solutions:**
1. Run `npm run dev` to regenerate types
2. Check `src/config/env.ts` exports
3. Verify all imports use correct path

### RPC Connection Failures

**Problem:** Cannot connect to blockchain

**Solutions:**
1. Check RPC URL is correct
2. Verify API key (if using paid provider)
3. Test RPC endpoint with curl:
   ```bash
   curl -X POST YOUR_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Aave V3 Deployments](https://docs.aave.com/developers/deployed-contracts/v3-mainnet)
- [Morpho Documentation](https://docs.morpho.org/)
- [Fluid Documentation](https://docs.fluid.instadapp.io/)

---

## ✅ Checklist

Before deploying:

- [ ] `.env` file created and configured
- [ ] `.env` added to `.gitignore`
- [ ] All RPC URLs tested and working
- [ ] API keys (if any) are valid
- [ ] Configuration validated successfully
- [ ] Application builds without errors
- [ ] All features working with new config

---

**Your configuration is now centralized, secure, and easy to manage! 🎉**
