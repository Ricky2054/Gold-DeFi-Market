import { motion } from 'framer-motion';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    className?: string;
}

export function Skeleton({
    width = '100%',
    height = '1rem',
    variant = 'text',
    className = ''
}: SkeletonProps) {
    const variantClasses = {
        text: 'skeleton-text',
        circular: 'skeleton-circular',
        rectangular: 'skeleton-rectangular',
        rounded: 'skeleton-rounded'
    };

    return (
        <motion.div
            className={`ui-skeleton ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
            animate={{
                opacity: [0.5, 1, 0.5]
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
        />
    );
}

// Pre-built skeleton for market cards
export function MarketCardSkeleton() {
    return (
        <div className="ui-card card-default skeleton-card">
            <div className="ui-card-header">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Skeleton width={80} height={24} variant="rounded" />
                    <Skeleton width={70} height={24} variant="rounded" />
                </div>
                <Skeleton width={60} height={28} variant="rounded" />
            </div>
            <div className="ui-card-content">
                <div className="ui-metric-grid metric-grid-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="ui-metric">
                            <Skeleton width={60} height={12} />
                            <Skeleton width={80} height={24} />
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <Skeleton width={120} height={14} />
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Skeleton height={48} variant="rounded" />
                        <Skeleton height={48} variant="rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading grid of skeleton cards
export function MarketGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="markets-grid">
            {Array.from({ length: count }).map((_, i) => (
                <MarketCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Recommendation section skeleton
export function RecommendationSkeleton() {
    return (
        <div className="ui-card card-gradient" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <div className="ui-card-header">
                <Skeleton width={200} height={32} />
            </div>
            <div className="ui-card-content">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <Skeleton width={300} height={24} />
                        <div style={{ marginTop: '1rem' }}>
                            <Skeleton width="100%" height={16} />
                        </div>
                        <Skeleton width="80%" height={16} />
                        <Skeleton width="60%" height={16} />
                    </div>
                    <div style={{ width: 150 }}>
                        <Skeleton width={150} height={100} variant="rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}
