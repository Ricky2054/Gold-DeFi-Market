import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';

interface ProgressProps {
    value: number;
    max?: number;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    showValue?: boolean;
    label?: string;
    animated?: boolean;
}

export function Progress({
    value,
    max = 100,
    variant = 'default',
    size = 'md',
    showValue = false,
    label,
    animated = true
}: ProgressProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={`ui-progress-wrapper progress-${size}`}>
            {(label || showValue) && (
                <div className="progress-header">
                    {label && <span className="progress-label">{label}</span>}
                    {showValue && <span className="progress-value">{value}/{max}</span>}
                </div>
            )}
            <ProgressPrimitive.Root
                className={`ui-progress progress-${variant}`}
                value={percentage}
            >
                <ProgressPrimitive.Indicator
                    className="ui-progress-indicator"
                    asChild
                >
                    {animated ? (
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    ) : (
                        <div style={{ width: `${percentage}%` }} />
                    )}
                </ProgressPrimitive.Indicator>
            </ProgressPrimitive.Root>
        </div>
    );
}

// Score gauge for recommendation scores
interface ScoreGaugeProps {
    score: number;
    maxScore?: number;
    label?: string;
}

export function ScoreGauge({ score, maxScore = 100, label = 'Score' }: ScoreGaugeProps) {
    const getScoreVariant = (score: number): 'success' | 'warning' | 'danger' => {
        if (score >= 70) return 'success';
        if (score >= 40) return 'warning';
        return 'danger';
    };

    const getScoreLabel = (score: number): string => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    return (
        <div className="ui-score-gauge">
            <div className="score-gauge-header">
                <span className="score-gauge-label">{label}</span>
                <span className={`score-gauge-rating score-${getScoreVariant(score)}`}>
                    {getScoreLabel(score)}
                </span>
            </div>
            <div className="score-gauge-display">
                <motion.span
                    className={`score-gauge-value score-${getScoreVariant(score)}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                >
                    {score.toFixed(0)}
                </motion.span>
                <span className="score-gauge-max">/{maxScore}</span>
            </div>
            <Progress value={score} max={maxScore} variant={getScoreVariant(score)} size="lg" />
        </div>
    );
}
