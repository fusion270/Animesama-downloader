import { useState, useEffect } from "react"
import { Bookmark, Trash2 } from "lucide-react"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { AnimeDetails } from "../components/AnimeDetails"
import { storage } from "../services/storage"
import type { MediaItem } from "../types"
import { motion } from "framer-motion"

export function MyList() {
    const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

    const loadList = async () => {
        const list = await storage.getWatchlist();
        setWatchlist(list);
    };

    useEffect(() => {
        loadList();
    }, []);

    const handleRemove = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await storage.removeFromWatchlist(id);
        loadList();
    };

    if (selectedItem) {
        return <AnimeDetails anime={selectedItem} onBack={() => setSelectedItem(null)} />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1">My List</h2>
                <p className="text-muted-foreground">Your saved animes and movies.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {watchlist.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                    >
                        <Card item={item} onClick={() => setSelectedItem(item)} />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 h-8 w-8"
                            onClick={(e) => handleRemove(e, item.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </motion.div>
                ))}
            </div>

            {watchlist.length === 0 && (
                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                    <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                        <Bookmark className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">Your list is empty</h3>
                    <p className="text-muted-foreground text-sm">Add animes or movies to your list to track them here.</p>
                </div>
            )}
        </div>
    )
}
