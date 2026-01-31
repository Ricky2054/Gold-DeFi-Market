import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
    content: React.ReactNode;
    children?: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    showIcon?: boolean;
}

export function Tooltip({ content, children, side = 'top', showIcon = false }: TooltipProps) {
    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <span className="tooltip-trigger">
                        {children}
                        {showIcon && <HelpCircle className="tooltip-icon" size={14} />}
                    </span>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        className="tooltip-content"
                        side={side}
                        sideOffset={5}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="tooltip-arrow" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}

export function InfoTooltip({ content, side = 'top' }: { content: React.ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>
                    <button className="info-tooltip-trigger" type="button" aria-label="More information">
                        <HelpCircle size={14} />
                    </button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        className="tooltip-content"
                        side={side}
                        sideOffset={5}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="tooltip-arrow" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}
