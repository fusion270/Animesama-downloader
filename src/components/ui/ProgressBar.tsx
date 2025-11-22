import { cn } from "../../lib/utils"

interface ProgressBarProps {
    value: number;
    max?: number;
    className?: string;
    colorClass?: string;
}

export function ProgressBar({ value, max = 100, className, colorClass = "bg-primary" }: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
            <div
                className={cn("h-full w-full flex-1 transition-all duration-500 ease-in-out", colorClass)}
                style={{ transform: `translateX(-${100 - percentage}%)` }}
            />
        </div>
    )
}
