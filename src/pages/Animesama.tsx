import { useState, useEffect, useMemo } from "react"
import { Search, RefreshCw, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"
import { AnimeDetails } from "../components/AnimeDetails"
import { Planning } from "./Planning"
import type { MediaItem } from "../types"
import { motion } from "framer-motion"

export function Animesama() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [selectedAnime, setSelectedAnime] = useState<MediaItem | null>(null);
    const [animes, setAnimes] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPlanning, setShowPlanning] = useState(false);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchCatalog = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/catalog');
            if (res.ok) {
                const data = await res.json();
                setAnimes(data);
            }
        } catch (error) {
            console.error("Failed to fetch catalog:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCatalog();
    }, []);

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await fetch('http://localhost:3001/api/update-catalog', { method: 'POST' });
            if (res.ok) {
                const result = await res.json();
                setAnimes(result.data);
                alert(`Updated! Found ${result.count} animes.`);
            }
        } catch (error) {
            console.error("Failed to update catalog:", error);
            alert("Update failed. Make sure server is running.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Memoize filtering to prevent freezing
    const filteredAnimes = useMemo(() => {
        if (!debouncedQuery) return animes;

        const lowerQuery = debouncedQuery.toLowerCase().trim();
        return animes.filter(anime =>
            anime.title.toLowerCase().includes(lowerQuery)
        );
    }, [animes, debouncedQuery]);

    // Limit to 20 when not searching to avoid overwhelming UI
    const displayedAnimes = debouncedQuery ? filteredAnimes : filteredAnimes.slice(0, 20);

    const featuredAnime = useMemo(() => animes.length > 0 ? animes[0] : null, [animes]);

    if (selectedAnime) {
        return <AnimeDetails anime={selectedAnime} onBack={() => setSelectedAnime(null)} />;
    }

    if (showPlanning) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => setShowPlanning(false)} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Retour au catalogue
                </Button>
                <Planning catalog={animes} onSelectAnime={setSelectedAnime} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">Animesama</h2>
                    <p className="text-muted-foreground">Browse and download your favorite animes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setShowPlanning(true)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Planning
                    </Button>
                    <Button onClick={handleUpdate} disabled={isUpdating}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
                        {isUpdating ? "Updating (this takes time)..." : "Update List"}
                    </Button>
                </div>
            </div>

            {/* Featured Section */}
            {featuredAnime && !debouncedQuery && (
                <div className="relative overflow-hidden rounded-2xl bg-secondary/30 border border-border/50 p-6 md:p-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
                    <div className="absolute inset-0">
                        <img
                            src={featuredAnime.image}
                            alt={featuredAnime.title}
                            className="h-full w-full object-cover opacity-20 blur-sm"
                        />
                    </div>

                    <div className="relative z-20 flex flex-col md:flex-row gap-6 items-start">
                        <img
                            src={featuredAnime.image}
                            alt={featuredAnime.title}
                            className="w-full md:w-[400px] aspect-video object-cover rounded-lg shadow-2xl border border-border/50"
                        />
                        <div className="space-y-4 max-w-2xl">
                            <div className="space-y-2">
                                <span className="inline-block px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-bold">
                                    Featured
                                </span>
                                <h3 className="text-2xl md:text-4xl font-bold">{featuredAnime.title}</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                {featuredAnime.description}
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                <Button size="lg" className="rounded-full" onClick={() => setSelectedAnime(featuredAnime)}>
                                    Watch Now
                                </Button>
                                <Button variant="outline" size="lg" className="rounded-full" onClick={() => setSelectedAnime(featuredAnime)}>
                                    Details
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Grid */}
            <div className="space-y-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search animes..."
                        className="pl-10 bg-secondary/50 border-transparent focus:bg-background transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-20">Loading catalog...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayedAnimes.map((anime, index) => (
                                <motion.div
                                    key={anime.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card item={anime} onClick={() => setSelectedAnime(anime)} />
                                </motion.div>
                            ))}
                        </div>

                        {displayedAnimes.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground">
                                {debouncedQuery ? `No animes found matching "${debouncedQuery}"` : "No animes found. Try updating the list."}
                            </div>
                        )}

                        {!debouncedQuery && filteredAnimes.length > 20 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                Showing 20 of {filteredAnimes.length} animes. Use search to find specific titles.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
