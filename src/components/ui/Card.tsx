import type { MediaItem } from "../../types"
import { cn } from "../../lib/utils"
import { PlayCircle } from "lucide-react"

interface CardProps {
    item: MediaItem;
    onClick?: () => void;
    className?: string;
}

export function Card({ item, onClick, className }: CardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer border border-border/50",
                className
            )}
            onClick={onClick}
        >
            <div className="aspect-video w-full overflow-hidden relative">
                <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white" />
                </div>
            </div>
            <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            </div>
        </div>
    )
}
