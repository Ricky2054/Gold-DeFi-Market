import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Calculator } from 'lucide-react';
import type { MarketRecommendation, LendingMarket } from '../types';

interface SavingsCalculatorProps {
  recommendation: MarketRecommendation;
  markets: LendingMarket[];
}

export const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ 
  recommendation, 
  markets 
}) => {
  const [loanAmount, setLoanAmount] = useState(10000);
  
  // Get best APR from the recommended market's borrow assets
  const bestAPR = recommendation.market.borrowAssets.length > 0
    ? Math.min(...recommendation.market.borrowAssets.map(a => a.borrowAPR))
    : 0;
  
  // Calculate average APR across all markets
  const allAPRs = markets.flatMap(m => m.borrowAssets.map(a => a.borrowAPR)).filter(apr => apr > 0);
  const averageAPR = allAPRs.length > 0 
    ? allAPRs.reduce((sum, apr) => sum + apr, 0) / allAPRs.length 
    : 0;
  
  // Get worst (highest) APR
  const worstAPR = allAPRs.length > 0 ? Math.max(...allAPRs) : 0;
  
  const savingsVsAverage = ((averageAPR - bestAPR) / 100) * loanAmount;
  const savingsVsWorst = ((worstAPR - bestAPR) / 100) * loanAmount;
  
  // Don't show if no meaningful data
  if (bestAPR <= 0 || allAPRs.length < 2) {
    return null;
  }
  
  return (
    <motion.div 
      className="savings-calculator-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="savings-header">
        <Calculator size={20} />
        <h3>Potential Annual Savings</h3>
      </div>
      
      <div className="loan-input-group">
        <label htmlFor="loan-amount">Loan Amount (USD)</label>
        <div className="input-wrapper">
          <span className="currency-symbol">$</span>
          <input
            id="loan-amount"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            min={100}
            step={1000}
            className="loan-input"
          />
        </div>
      </div>
      
      <div className="savings-results">
        <div className="savings-card">
          <span className="savings-label">vs. Average Market</span>
          <div className="savings-value-wrapper">
            <TrendingDown size={16} style={{ color: 'var(--apr-good)' }} />
            <span className="savings-value" style={{ color: 'var(--apr-good)' }}>
              ${savingsVsAverage.toFixed(2)}
            </span>
            <span className="savings-period">/year</span>
          </div>
        </div>
        
        <div className="savings-card highlight">
          <span className="savings-label">vs. Worst Market</span>
          <div className="savings-value-wrapper">
            <TrendingDown size={16} style={{ color: 'var(--gold-primary)' }} />
            <span className="savings-value" style={{ color: 'var(--gold-primary)' }}>
              ${savingsVsWorst.toFixed(2)}
            </span>
            <span className="savings-period">/year</span>
          </div>
        </div>
      </div>
      
      <div className="savings-note">
        <DollarSign size={14} />
        <span>Based on current APR rates. Actual savings may vary.</span>
      </div>
    </motion.div>
  );
};
