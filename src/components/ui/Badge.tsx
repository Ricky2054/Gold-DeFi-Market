import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Circle, Coins } from 'lucide-react';

// Chain Logo SVGs
const EthereumLogo = () => (
    <svg width="12" height="12" viewBox="0 0 256 417" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M127.961 0L125.166 9.5V285.168L127.961 287.958L255.923 212.32L127.961 0Z" fill="#627EEA"/>
        <path d="M127.962 0L0 212.32L127.962 287.959V154.158V0Z" fill="#8C9FEA"/>
        <path d="M127.961 312.187L126.386 314.107V412.306L127.961 416.905L255.999 236.587L127.961 312.187Z" fill="#627EEA"/>
        <path d="M127.962 416.905V312.187L0 236.587L127.962 416.905Z" fill="#8C9FEA"/>
    </svg>
);

const ArbitrumLogo = () => (
    <svg width="12" height="12" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#213147"/>
        <path d="M186.2 150.6L169.4 178.6L133.8 119L151.6 91.2L186.2 150.6Z" fill="#12AAFF"/>
        <path d="M216 181.8L201.2 205.6L151.6 91.2L182.8 91.2L216 181.8Z" fill="white"/>
        <path d="M40 181.8L73.2 91.2H104.4L54.8 205.6L40 181.8Z" fill="white"/>
        <path d="M104.4 91.2L122.2 119L86.6 178.6L69.8 150.6L104.4 91.2Z" fill="#12AAFF"/>
        <path d="M128 164.8L145.6 196H110.4L128 164.8Z" fill="white"/>
    </svg>
);

const OptimismLogo = () => (
    <svg width="12" height="12" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#FF0420"/>
        <path d="M81.5 169.5C71.3 169.5 63.1 166.5 57.1 160.7C51.1 154.7 48.1 146.5 48.1 136.1C48.1 123.3 52.1 112.7 60.1 104.3C68.3 95.9 78.7 91.7 91.5 91.7C101.7 91.7 109.7 94.7 115.7 100.5C121.7 106.3 124.7 114.3 124.7 124.5C124.7 137.3 120.7 147.9 112.7 156.3C104.7 164.5 94.3 169.5 81.5 169.5ZM82.9 152.1C88.1 152.1 92.5 149.7 96.1 145.1C99.7 140.3 101.5 133.7 101.5 125.3C101.5 119.7 100.1 115.3 97.3 112.1C94.5 108.9 90.7 107.3 85.9 107.3C80.7 107.3 76.3 109.7 72.7 114.5C69.1 119.1 67.3 125.7 67.3 134.1C67.3 139.7 68.7 144.1 71.5 147.3C74.3 150.5 78.1 152.1 82.9 152.1Z" fill="white"/>
        <path d="M132.5 168V93.2H158.1C169.7 93.2 178.5 95.6 184.5 100.4C190.5 105.2 193.5 112.2 193.5 121.4C193.5 131.4 190.1 139.2 183.3 144.8C176.5 150.4 167.1 153.2 155.1 153.2H151.3V168H132.5ZM151.3 138.8H154.3C159.7 138.8 163.9 137.6 166.9 135.2C169.9 132.8 171.5 129.2 171.5 124.4C171.5 120.2 170.3 117 167.9 114.8C165.5 112.6 162.1 111.4 157.5 111.4H151.3V138.8Z" fill="white"/>
    </svg>
);

const PolygonLogo = () => (
    <svg width="12" height="12" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#8247E5"/>
        <path d="M181.5 99.5L150 79.5C145.5 77 140 77 135.5 79.5L112 93L96 84L135.5 60.5C145 55 157 55 166.5 60.5L206 84V130L181.5 144.5V99.5Z" fill="white"/>
        <path d="M74.5 156.5L106 176.5C110.5 179 116 179 120.5 176.5L144 163L160 172L120.5 195.5C111 201 99 201 89.5 195.5L50 172V126L74.5 111.5V156.5Z" fill="white"/>
        <path d="M160 116L144 107L120.5 120.5C116 123 110.5 123 106 120.5L74.5 100.5V156.5L50 172V84L89.5 60.5C99 55 111 55 120.5 60.5L160 84V116Z" fill="white" fillOpacity="0.5"/>
    </svg>
);

const DefaultChainIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

// Protocol Logo SVGs
const AaveLogo = () => (
    <svg width="12" height="12" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#B6509E"/>
        <path d="M195.2 183.3L141.3 70.3C138.8 65.3 133.6 62 128 62C122.4 62 117.2 65.3 114.7 70.3L98.4 104.2L82.8 71.3C80.3 66.2 75.1 63 69.5 63H48L100.1 169.3C102.6 174.3 107.8 177.6 113.4 177.6C119 177.6 124.2 174.3 126.7 169.3L142.2 137.3L157.3 169.3C159.8 174.3 165 177.6 170.6 177.6H208L195.2 183.3Z" fill="white"/>
    </svg>
);

const MorphoLogo = () => (
    <svg width="12" height="12" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#2470FF"/>
        <path d="M128 48L176 96V160L128 208L80 160V96L128 48Z" fill="white" fillOpacity="0.9"/>
        <path d="M128 80L152 104V152L128 176L104 152V104L128 80Z" fill="#2470FF"/>
    </svg>
);

const FluidLogo = () => (
    <svg width="12" height="12" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="128" cy="128" r="128" fill="#00D4AA"/>
        <path d="M128 56C89.3 56 58 87.3 58 126C58 164.7 89.3 196 128 196C152.2 196 173.4 183.4 185.5 164.4L162.5 150.4C155.2 161.6 142.5 169 128 169C104.3 169 85 149.7 85 126C85 102.3 104.3 83 128 83C141.4 83 153.4 89.5 161 99.5L184.3 86.3C172.2 68.3 151.6 56 128 56Z" fill="white"/>
        <circle cx="168" cy="126" r="18" fill="white"/>
    </svg>
);

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

// Protocol-specific badges with actual logos
export function ProtocolBadge({ protocol }: { protocol: string }) {
    const getProtocolIcon = (protocol: string): ReactNode => {
        switch (protocol.toLowerCase()) {
            case 'aave':
                return <AaveLogo />;
            case 'morpho':
                return <MorphoLogo />;
            case 'fluid':
                return <FluidLogo />;
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

// Chain-specific badges with actual logos
export function ChainBadge({ chain }: { chain: string }) {
    const getChainIcon = (chain: string): ReactNode => {
        switch (chain.toLowerCase()) {
            case 'ethereum':
                return <EthereumLogo />;
            case 'arbitrum':
                return <ArbitrumLogo />;
            case 'optimism':
                return <OptimismLogo />;
            case 'polygon':
                return <PolygonLogo />;
            default:
                return <DefaultChainIcon />;
        }
    };

    return (
        <Badge variant="chain" icon={getChainIcon(chain)}>
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
