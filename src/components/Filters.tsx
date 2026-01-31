import type { CollateralToken, Chain, Protocol } from '../types';
import { Select } from './ui';
import { Coins, Link, Layers, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface FiltersProps {
    selectedCollateral: CollateralToken;
    selectedChain: Chain | 'All';
    selectedProtocol: Protocol | 'All';
    availableChains: Chain[];
    availableProtocols: string[];
    onCollateralChange: (collateral: CollateralToken) => void;
    onChainChange: (chain: Chain | 'All') => void;
    onProtocolChange: (protocol: Protocol | 'All') => void;
}

export function Filters({
    selectedCollateral,
    selectedChain,
    selectedProtocol,
    availableChains,
    availableProtocols,
    onCollateralChange,
    onChainChange,
    onProtocolChange,
}: FiltersProps) {
    const collateralOptions = [
        { 
            value: 'XAUT', 
            label: 'XAUT (Tether Gold)',
            description: 'Gold-backed stablecoin by Tether'
        },
        { 
            value: 'PAXG', 
            label: 'PAXG (Paxos Gold)',
            description: 'Gold-backed token by Paxos'
        }
    ];

    const chainOptions = [
        { value: 'All', label: 'All Chains' },
        ...availableChains.map(chain => ({
            value: chain,
            label: chain
        }))
    ];

    const protocolOptions = [
        { value: 'All', label: 'All Protocols' },
        ...availableProtocols.map(protocol => ({
            value: protocol,
            label: protocol
        }))
    ];

    return (
        <motion.div 
            className="filters-section"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="filters-header">
                <h3 className="filters-title">
                    <Filter size={18} className="filters-icon" />
                    Filter Markets
                </h3>
                <p className="filters-description">
                    Narrow down markets by your preferred collateral, blockchain, or protocol
                </p>
            </div>
            
            <div className="filters-grid">
                <Select
                    value={selectedCollateral}
                    onValueChange={(value) => onCollateralChange(value as CollateralToken)}
                    options={collateralOptions}
                    label="Collateral Asset"
                    tooltip="The gold-backed token you'll deposit as security. Your collateral earns no interest but enables you to borrow other assets."
                    icon={<Coins size={16} />}
                />

                <Select
                    value={selectedChain}
                    onValueChange={(value) => onChainChange(value as Chain | 'All')}
                    options={chainOptions}
                    label="Blockchain Network"
                    tooltip="The blockchain where you'll interact. Each chain has different gas fees and transaction speeds."
                    icon={<Link size={16} />}
                />

                <Select
                    value={selectedProtocol}
                    onValueChange={(value) => onProtocolChange(value as Protocol | 'All')}
                    options={protocolOptions}
                    label="Lending Protocol"
                    tooltip="The DeFi platform managing the loans. Each protocol has different features, rates, and security measures."
                    icon={<Layers size={16} />}
                />
            </div>
        </motion.div>
    );
}
