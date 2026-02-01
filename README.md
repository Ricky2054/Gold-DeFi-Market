# Goldify

A read-only DeFi analytics app that compares borrowing options using gold-backed tokens (XAUT & PAXG) across Aave, Morpho, and Fluid protocols.

## 🔗 Links

- **Live App**: [https://gold-de-fi-market.vercel.app/](https://gold-de-fi-market.vercel.app/)
- **GitHub**: [https://github.com/Ricky2054/Gold-DeFi-Market](https://github.com/Ricky2054/Gold-DeFi-Market)

## ✨ Features

- Compare borrowing rates across Aave V3, Morpho Blue, and Fluid
- Multi-chain support: Ethereum, Arbitrum, Optimism
- Smart recommendations based on APR, liquidity, and risk parameters
- Transparent scoring with detailed breakdowns
- No wallet connection required

## 📊 Data Sources

| Protocol | Method | Source |
|----------|--------|--------|
| **Aave V3** | RPC Calls | UiPoolDataProvider contract |
| **Morpho Blue** | RPC Calls | Morpho contract + MarketParamsLib |
| **Fluid** | REST API | Fluid API (api.fluid.instadapp.io) |

All data is fetched in real-time from blockchain networks (Ethereum, Arbitrum, Optimism).

## 🧠 Recommendation Logic

The app answers: **"Where should a user borrow from and why?"**

Scoring factors (transparent & explainable):
- **Lower APR** = Higher score
- **Higher liquidity** = Higher score  
- **Higher LTV** = Higher score (more capital efficient)
- **Reasonable liquidation buffer** = Higher score

## ⚠️ Key Assumptions & Limitations

- **Read-only**: No wallet connection or transaction signing
- **Collateral focus**: Only gold-backed tokens (XAUT, PAXG)
- **Borrow assets**: USDC, USDT, DAI, WETH, WBTC
- **Data freshness**: Relies on RPC/API availability
- **Morpho markets**: Only includes markets with sufficient liquidity

## 🏗️ Design Decisions

1. **Protocol Adapter Pattern**: Each protocol has its own adapter implementing a common interface for clean separation
2. **Hybrid Data Fetching**: RPC for Aave/Morpho (most accurate), REST API for Fluid (performance)
3. **Client-side only**: No backend required - all fetching happens in browser
4. **Deterministic scoring**: Transparent algorithm users can understand and verify

## 🚀 Run Locally

```bash
git clone https://github.com/Ricky2054/Gold-DeFi-Market.git
cd Gold-DeFi-Market
npm install
npm run dev
```

## 🛠️ Tech Stack

- React 19 + TypeScript
- Vite
- ethers.js (RPC calls)
- ECharts (visualizations)
- Framer Motion (animations)

---

Built for the DeFi Gold Lending Aggregator interview task.
