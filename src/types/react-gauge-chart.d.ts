declare module 'react-gauge-chart' {
    import { ComponentType } from 'react';
    
    interface GaugeChartProps {
        id?: string;
        className?: string;
        style?: React.CSSProperties;
        marginInPercent?: number;
        cornerRadius?: number;
        nrOfLevels?: number;
        percent?: number;
        arcPadding?: number;
        arcWidth?: number;
        arcsLength?: number[];
        colors?: string[];
        textColor?: string;
        needleColor?: string;
        needleBaseColor?: string;
        hideText?: boolean;
        animate?: boolean;
        animDelay?: number;
        animateDuration?: number;
        formatTextValue?: (value: string) => string;
    }
    
    const GaugeChart: ComponentType<GaugeChartProps>;
    export default GaugeChart;
}
