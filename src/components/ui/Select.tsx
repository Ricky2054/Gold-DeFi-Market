import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { InfoTooltip } from './Tooltip';

interface SelectOption {
    value: string;
    label: string;
    description?: string;
}

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    label?: string;
    tooltip?: string;
    icon?: React.ReactNode;
}

export function Select({
    value,
    onValueChange,
    options,
    placeholder = 'Select an option',
    label,
    tooltip,
    icon
}: SelectProps) {
    return (
        <div className="ui-select-wrapper">
            {label && (
                <label className="ui-select-label">
                    {icon && <span className="select-label-icon">{icon}</span>}
                    {label}
                    {tooltip && <InfoTooltip content={tooltip} />}
                </label>
            )}
            <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
                <SelectPrimitive.Trigger className="ui-select-trigger">
                    <SelectPrimitive.Value placeholder={placeholder} />
                    <SelectPrimitive.Icon className="ui-select-icon">
                        <ChevronDown size={18} />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content className="ui-select-content" position="popper" sideOffset={4}>
                        <SelectPrimitive.Viewport className="ui-select-viewport">
                            {options.map((option) => (
                                <SelectPrimitive.Item
                                    key={option.value}
                                    value={option.value}
                                    className="ui-select-item"
                                >
                                    <SelectPrimitive.ItemText>
                                        <span className="select-item-label">{option.label}</span>
                                        {option.description && (
                                            <span className="select-item-description">{option.description}</span>
                                        )}
                                    </SelectPrimitive.ItemText>
                                    <SelectPrimitive.ItemIndicator className="ui-select-indicator">
                                        <Check size={16} />
                                    </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
        </div>
    );
}
