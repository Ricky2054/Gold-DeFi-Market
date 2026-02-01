import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';
import GaugeChart from 'react-gauge-chart';

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

// Score gauge for recommendation scores - Speedometer style
interface ScoreGaugeProps {
    score: number;
    maxScore?: number;
    label?: string;
}

export function ScoreGauge({ score, maxScore = 100, label = 'Score' }: ScoreGaugeProps) {
    const getScoreLabel = (score: number): string => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return '#22C55E';
        if (score >= 60) return '#84CC16';
        if (score >= 40) return '#EAB308';
        if (score >= 20) return '#F97316';
        return '#EF4444';
    };

    // Convert score to percentage (0-1)
    const percent = Math.min(1, Math.max(0, score / maxScore));

    return (
        <div className="ui-score-gauge-speedometer">
            <div className="score-gauge-header">
                <span className="score-gauge-label">{label}</span>
                <span className="score-gauge-value" style={{ color: getScoreColor(score) }}>{score.toFixed(0)}</span>
            </div>
            <div className="gauge-container">
                <GaugeChart
                    id="score-gauge"
                    nrOfLevels={5}
                    arcsLength={[0.2, 0.2, 0.2, 0.2, 0.2]}
                    colors={['#EF4444', '#F97316', '#EAB308', '#84CC16', '#22C55E']}
                    percent={percent}
                    arcPadding={0.02}
                    arcWidth={0.25}
                    cornerRadius={3}
                    needleColor="#D4AF37"
                    needleBaseColor="#D4AF37"
                    textColor="transparent"
                    animate={true}
                    animDelay={0}
                    animateDuration={1500}
                    formatTextValue={() => ''}
                />
                <div className="gauge-bottom-label">
                    <span className="gauge-label" style={{ color: getScoreColor(score) }}>
                        {getScoreLabel(score)}
                    </span>
                </div>
            </div>
        </div>
    );
}
