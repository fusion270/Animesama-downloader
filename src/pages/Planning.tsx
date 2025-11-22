import { useState, useEffect } from "react"
import { Check, Clock, Play } from "lucide-react"
import { Button } from "../components/ui/Button"
import type { MediaItem } from "../types"

interface Anime {
    title: string;
    image: string;
    link: string;
    time: string;
    language: string;
    isDownloaded: boolean;
}

interface DayPlanning {
    day: string;
    date: string;
    animes: Anime[];
}

interface PlanningProps {
    catalog: MediaItem[];
    onSelectAnime: (anime: MediaItem) => void;
}

export function Planning({ catalog, onSelectAnime }: PlanningProps) {
    const [planning, setPlanning] = useState<DayPlanning[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPlanning();
    }, []);

    const fetchPlanning = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/planning');
            if (!response.ok) throw new Error('Failed to fetch planning');
            const data = await response.json();

            // Filter to keep only days that have downloaded animes
            const filteredData = data.map((day: DayPlanning) => ({
                ...day,
                animes: day.animes.filter(anime => anime.isDownloaded)
            })).filter((day: DayPlanning) => day.animes.length > 0);

            setPlanning(filteredData);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger le planning. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnime = (animeTitle: string) => {
        // Normalize titles for comparison
        const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '');
        const target = normalize(animeTitle);

        const found = catalog.find(item => normalize(item.title).includes(target) || target.includes(normalize(item.title)));

        if (found) {
            onSelectAnime(found);
        } else {
            alert("Fiche introuvable dans le catalogue.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Chargement du planning...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-destructive text-lg">{error}</p>
                <Button onClick={fetchPlanning} variant="outline">Réessayer</Button>
            </div>
        );
    }

    if (planning.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4 text-center">
                <p className="text-muted-foreground text-lg">Aucun anime du planning n'est présent dans vos téléchargements.</p>
                <p className="text-sm text-muted-foreground/60">Assurez-vous que le nom du dossier de l'anime correspond au titre sur Anime-Sama.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1">Planning</h2>
                <p className="text-muted-foreground">Vos animes téléchargés qui sortent cette semaine.</p>
            </div>

            <div className="space-y-12">
                {planning.map((day, index) => (
                    <section key={index} className="space-y-4">
                        <div className="flex items-baseline gap-3 border-b border-border/50 pb-2">
                            <h3 className="text-2xl font-bold text-primary">{day.day}</h3>
                            <span className="text-lg text-muted-foreground">{day.date}</span>
                        </div>

                        {/* Updated grid for wider cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {day.animes.map((anime, animeIndex) => (
                                <div
                                    key={animeIndex}
                                    className="group relative flex flex-col rounded-xl overflow-hidden bg-[#0f172a] border border-white/5 transition-all hover:scale-105 hover:shadow-2xl hover:border-primary/50"
                                >
                                    {/* Image Section - Landscape */}
                                    <div className="relative aspect-video w-full overflow-hidden">
                                        <img
                                            src={anime.image}
                                            alt={anime.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />

                                        {/* Top Badges */}
                                        <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start">
                                            <span className="px-2 py-1 rounded bg-[#1e293b]/90 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm border border-white/10">
                                                Anime
                                            </span>

                                            {/* Language Flag/Badge */}
                                            <span className="px-2 py-1 rounded bg-[#1e293b]/90 text-white text-[10px] font-bold shadow-lg backdrop-blur-sm border border-white/10">
                                                {anime.language}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex flex-col flex-1 p-4 space-y-4">
                                        {/* Title */}
                                        <h4 className="font-black text-white text-center text-sm uppercase leading-tight line-clamp-2 min-h-[2.5em]" title={anime.title}>
                                            {anime.title}
                                        </h4>

                                        {/* Action Buttons Container */}
                                        <div className="space-y-2 mt-auto">
                                            {/* Time Badge */}
                                            <div className="w-full py-2 rounded-lg bg-[#1e293b] border border-white/5 flex items-center justify-center gap-2 text-blue-200 font-bold text-sm">
                                                <Clock className="w-4 h-4" />
                                                {anime.time}
                                            </div>

                                            {/* View Button */}
                                            <button
                                                className="w-full py-2 rounded-lg bg-[#1e293b] border border-white/5 flex items-center justify-center gap-2 text-white font-bold text-sm transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                                onClick={() => handleSelectAnime(anime.title)}
                                            >
                                                <Play className="w-4 h-4" />
                                                Voir la fiche
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}
