import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    onClick,
    type = 'button'
}: ButtonProps) {
    return (
        <motion.button
            type={type}
            className={`ui-button btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ duration: 0.15 }}
        >
            {loading ? (
                <span className="btn-spinner" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
                    <span className="btn-text">{children}</span>
                    {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
                </>
            )}
        </motion.button>
    );
}
