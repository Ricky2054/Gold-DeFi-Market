import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'gradient' | 'glass';
    hoverable?: boolean;
    delay?: number;
}

export function Card({ 
    children, 
    className = '', 
    variant = 'default',
    hoverable = true,
    delay = 0
}: CardProps) {
    const variantClasses = {
        default: 'card-default',
        elevated: 'card-elevated',
        gradient: 'card-gradient',
        glass: 'card-glass'
    };

    return (
        <motion.div
            className={`ui-card ${variantClasses[variant]} ${hoverable ? 'card-hoverable' : ''} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                duration: 0.4, 
                delay: delay * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={hoverable ? { 
                y: -4,
                transition: { duration: 0.2 }
            } : undefined}
        >
            {children}
        </motion.div>
    );
}

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`ui-card-header ${className}`}>
            {children}
        </div>
    );
}

interface CardContentProps {
    children: ReactNode;
    className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
    return (
        <div className={`ui-card-content ${className}`}>
            {children}
        </div>
    );
}

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`ui-card-footer ${className}`}>
            {children}
        </div>
    );
}
