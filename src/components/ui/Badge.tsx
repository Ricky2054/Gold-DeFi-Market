import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Ghost, Droplets, Hexagon, Circle, Link, Coins } from 'lucide-react';

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gold' | 'protocol' | 'chain';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    animated?: boolean;
}

export function Badge({ 
    children, 
    variant = 'default', 
    size = 'md',
    icon,
    animated = false
}: BadgeProps) {
    const Component = animated ? motion.span : 'span';
    const animationProps = animated ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3 }
    } : {};

    return (
        <Component
            className={`ui-badge badge-${variant} badge-${size}`}
            {...animationProps}
        >
            {icon && <span className="badge-icon">{icon}</span>}
            {children}
        </Component>
    );
}

// Protocol-specific badges with icons
export function ProtocolBadge({ protocol }: { protocol: string }) {
    const getProtocolIcon = (protocol: string): ReactNode => {
        switch (protocol.toLowerCase()) {
            case 'aave':
                return <Ghost size={12} />;
            case 'morpho':
                return <Hexagon size={12} />;
            case 'fluid':
                return <Droplets size={12} />;
            default:
                return <Circle size={12} />;
        }
    };

    return (
        <Badge variant="protocol" icon={getProtocolIcon(protocol)}>
            {protocol}
        </Badge>
    );
}

// Chain-specific badges with icons
export function ChainBadge({ chain }: { chain: string }) {
    const getChainIcon = (): ReactNode => {
        return <Link size={12} />;
    };

    return (
        <Badge variant="chain" icon={getChainIcon()}>
            {chain}
        </Badge>
    );
}

// Collateral badge with gold styling
export function CollateralBadge({ collateral }: { collateral: string }) {
    return (
        <Badge variant="gold" icon={<Coins size={12} />}>
            {collateral}
        </Badge>
    );
}
