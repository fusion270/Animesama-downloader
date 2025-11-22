import { useState } from "react"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card } from "../components/ui/Card"
import { mockMovies } from "../data/mockData"
import { motion } from "framer-motion"

export function Xalaflix() {
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleUpdate = () => {
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 2000);
    };

    const filteredMovies = mockMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const featuredMovie = mockMovies[0];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">Xalaflix</h2>
                    <p className="text-muted-foreground">Discover movies and series.</p>
                </div>
                <Button onClick={handleUpdate} disabled={isUpdating}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
                    {isUpdating ? "Updating..." : "Update Catalog"}
                </Button>
            </div>

            {/* Featured Section */}
            <div className="relative overflow-hidden rounded-2xl bg-secondary/30 border border-border/50 p-6 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
                <div className="absolute inset-0">
                    <img
                        src={featuredMovie.image}
                        alt={featuredMovie.title}
                        className="h-full w-full object-cover opacity-20 blur-sm"
                    />
                </div>

                <div className="relative z-20 flex flex-col md:flex-row gap-6 items-start">
                    <img
                        src={featuredMovie.image}
                        alt={featuredMovie.title}
                        className="w-32 md:w-48 rounded-lg shadow-2xl border border-border/50"
                    />
                    <div className="space-y-4 max-w-2xl">
                        <div className="space-y-2">
                            <span className="inline-block px-2 py-1 rounded-md bg-red-500/20 text-red-500 text-xs font-bold">
                                Top Pick
                            </span>
                            <h3 className="text-2xl md:text-4xl font-bold">{featuredMovie.title}</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            {featuredMovie.description}
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <Button size="lg" className="rounded-full bg-red-600 hover:bg-red-700 text-white">
                                Watch Now
                            </Button>
                            <Button variant="outline" size="lg" className="rounded-full">
                                Info
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Grid */}
            <div className="space-y-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search movies & series..."
                        className="pl-10 bg-secondary/50 border-transparent focus:bg-background transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredMovies.map((movie, index) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card item={movie} />
                        </motion.div>
                    ))}
                </div>

                {filteredMovies.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No movies found matching "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    )
}
