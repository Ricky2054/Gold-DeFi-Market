import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, X, BookOpen, Lightbulb } from 'lucide-react';

interface GlossaryTerm {
    term: string;
    simple: string;
    detailed: string;
    example?: string;
}

const glossaryTerms: GlossaryTerm[] = [
    {
        term: 'Collateral',
        simple: 'Security deposit you lock up to borrow money',
        detailed: 'Just like when you pawn jewelry to get cash, you deposit valuable tokens as collateral. If you don\'t repay, your collateral can be taken.',
        example: 'Deposit $1000 of gold tokens → Borrow up to $750 in stablecoins'
    },
    {
        term: 'LTV (Loan-to-Value)',
        simple: 'How much you can borrow compared to what you deposited',
        detailed: 'A 75% LTV means you can borrow $75 for every $100 of collateral you deposit. Higher LTV = more borrowing power but more risk.',
        example: '75% LTV: Deposit $1000 → Borrow up to $750'
    },
    {
        term: 'Liquidation',
        simple: 'When your loan is forcibly repaid using your collateral',
        detailed: 'If your collateral value drops too much (or debt grows), the protocol sells your collateral to repay the loan. You lose your deposit but keep what you borrowed.',
        example: 'If gold price drops 30%, your $1000 collateral might be liquidated'
    },
    {
        term: 'APR (Annual Percentage Rate)',
        simple: 'The yearly interest rate you pay on borrowed money',
        detailed: 'Like credit card interest. If you borrow $1000 at 5% APR, you\'ll owe about $1050 after one year (interest accrues continuously).',
        example: 'Borrow $1000 at 5% APR → Pay ~$50/year in interest'
    },
    {
        term: 'Liquidity',
        simple: 'How much money is available to borrow',
        detailed: 'High liquidity means lots of people have deposited funds for lending. You want high liquidity so you can borrow what you need and exit easily.',
        example: '$10M liquidity = plenty available; $10K liquidity = might not cover large loans'
    },
    {
        term: 'Safety Buffer',
        simple: 'Your cushion before getting liquidated',
        detailed: 'The gap between your borrowing limit (LTV) and liquidation point. A bigger buffer gives you more room for price swings.',
        example: 'LTV 75%, Liquidation at 82% = 7% safety buffer'
    },
    {
        term: 'Protocol',
        simple: 'The DeFi app/platform that handles the lending',
        detailed: 'Think of protocols like different banks - Aave, Morpho, and Fluid each have their own rules, rates, and features for lending and borrowing.',
        example: 'Aave = largest lending protocol; Morpho = offers peer-to-peer matching'
    },
    {
        term: 'Gold-Backed Tokens',
        simple: 'Crypto tokens backed by real physical gold',
        detailed: 'XAUT and PAXG are tokens where each token represents ownership of real gold stored in vaults. 1 token = 1 troy ounce of gold.',
        example: 'XAUT by Tether, PAXG by Paxos - both backed 1:1 with gold'
    }
];

export function Glossary() {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

    return (
        <>
            {/* Floating Help Button */}
            <motion.button
                className="glossary-trigger"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open DeFi Glossary"
            >
                <HelpCircle size={20} />
                <span>DeFi Terms</span>
            </motion.button>

            {/* Glossary Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="glossary-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            className="glossary-panel"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="glossary-header">
                                <div>
                                    <h2><BookOpen size={20} /> DeFi Glossary</h2>
                                    <p>Simple explanations for beginners</p>
                                </div>
                                <button 
                                    className="glossary-close"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close glossary"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="glossary-content">
                                {glossaryTerms.map((item) => (
                                    <motion.div
                                        key={item.term}
                                        className={`glossary-item ${expandedTerm === item.term ? 'expanded' : ''}`}
                                        layout
                                    >
                                        <button
                                            className="glossary-item-header"
                                            onClick={() => setExpandedTerm(
                                                expandedTerm === item.term ? null : item.term
                                            )}
                                        >
                                            <span className="glossary-term">{item.term}</span>
                                            <div className="glossary-item-toggle">
                                                {expandedTerm === item.term ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                            </div>
                                        </button>
                                        <div className="glossary-simple">{item.simple}</div>
                                        <AnimatePresence>
                                            {expandedTerm === item.term && (
                                                <motion.div
                                                    className="glossary-details"
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <p className="glossary-detailed">{item.detailed}</p>
                                                    {item.example && (
                                                        <div className="glossary-example">
                                                            <span className="example-label">Example:</span>
                                                            <span>{item.example}</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                            
                            <div className="glossary-footer">
                                <p><Lightbulb size={14} /> Tip: Hover over any metric with a <HelpCircle size={12} /> icon to see a quick explanation!</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
