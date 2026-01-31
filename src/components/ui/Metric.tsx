import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { InfoTooltip } from './Tooltip';

interface MetricProps {
    label: string;
    value: string | number;
    subValue?: string;
    tooltip?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    icon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
}

export function Metric({
    label,
    value,
    subValue,
    tooltip,
    variant = 'default',
    icon,
    size = 'md',
    animated = true
}: MetricProps) {
    const Component = animated ? motion.div : 'div';
    const animationProps = animated ? {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 }
    } : {};

    return (
        <Component
            className={`ui-metric metric-${size}`}
            {...animationProps}
        >
            <div className="metric-header">
                <span className="metric-label">
                    {icon && <span className="metric-icon">{icon}</span>}
                    {label}
                </span>
                {tooltip && <InfoTooltip content={tooltip} />}
            </div>
            <div className={`metric-value metric-${variant}`}>
                {value}
            </div>
            {subValue && (
                <div className="metric-subvalue">
                    {subValue}
                </div>
            )}
        </Component>
    );
}

interface MetricGridProps {
    children: ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}

export function MetricGrid({ children, columns = 2, className = '' }: MetricGridProps) {
    return (
        <div className={`ui-metric-grid metric-grid-${columns} ${className}`}>
            {children}
        </div>
    );
}
