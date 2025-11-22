import { useState, useEffect } from "react"
import { ArrowLeft, Download, Clock, Check, Plus } from "lucide-react"
import { Button } from "./ui/Button"
import { DownloadModal } from "./DownloadModal"
import { storage } from "../services/storage"
import type { MediaItem } from "../types"

interface AnimeDetailsProps {
    anime: MediaItem;
    onBack: () => void;
}

export function AnimeDetails({ anime, onBack }: AnimeDetailsProps) {
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isInList, setIsInList] = useState(false);
    const [episodesData, setEpisodesData] = useState<any>(null);
    const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

    useEffect(() => {
        storage.isInWatchlist(anime.id).then(setIsInList);
    }, [anime.id]);

    useEffect(() => {
        // Fetch episodes when component mounts
        const fetchEpisodes = async () => {
            if (!anime.link) return;

            setIsLoadingEpisodes(true);
            try {
                const response = await fetch('http://localhost:3001/api/anime-episodes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        animeLink: anime.link,
                        languages: anime.languages || 'VOSTFR'
                    })
                });

                const data = await response.json();
                if (data.success) {
                    setEpisodesData(data.episodes);
                }
            } catch (error) {
                console.error('Failed to fetch episodes:', error);
            } finally {
                setIsLoadingEpisodes(false);
            }
        };

        fetchEpisodes();
    }, [anime.link, anime.languages]);

    const toggleList = async () => {
        if (isInList) {
            await storage.removeFromWatchlist(anime.id);
            setIsInList(false);
        } else {
            await storage.addToWatchlist(anime);
            setIsInList(true);
        }
    };

    // Calculate total episodes from episodesData
    const totalEpisodes = episodesData
        ? Object.values(episodesData).reduce((total: number, langData: any) => {
            return total + Object.values(langData).reduce((langTotal: number, season: any) => {
                return langTotal + (season.episodeCount || 0);
            }, 0);
        }, 0)
        : 0;

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button variant="ghost" onClick={onBack} className="mb-4 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Browse
                </Button>

                {/* Hero Section */}
                <div className="relative rounded-2xl overflow-hidden aspect-video w-full max-h-[500px] group">
                    <img
                        src={anime.image}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">{anime.title}</h1>

                        <div className="flex items-center gap-6 text-sm md:text-base text-white/90 mb-6">
                            {totalEpisodes > 0 && (
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <Clock className="w-4 h-4" />
                                    <span>{totalEpisodes} Épisode{totalEpisodes > 1 ? 's' : ''}</span>
                                </div>
                            )}
                            {anime.languages && (
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <span className="font-semibold">{anime.languages}</span>
                                </div>
                            )}
                        </div>

                        <p className="text-lg text-gray-200 max-w-3xl line-clamp-3 mb-8 drop-shadow-md">
                            {anime.description}
                        </p>

                        <div className="flex items-center gap-4">
                            <Button
                                size="lg"
                                className="h-12 px-8 text-lg shadow-xl shadow-primary/20"
                                onClick={() => setIsDownloadModalOpen(true)}
                                disabled={isLoadingEpisodes}
                            >
                                <Download className="mr-2 h-5 w-5" />
                                {isLoadingEpisodes ? 'Chargement...' : 'Télécharger'}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className={`h-12 px-8 text-lg backdrop-blur-sm border-white/20 hover:bg-white/10 transition-all ${isInList ? "bg-green-500/20 text-green-400 border-green-500/50" : "bg-black/20"}`}
                                onClick={toggleList}
                            >
                                {isInList ? (
                                    <>
                                        <Check className="mr-2 h-5 w-5" />
                                        Added to List
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-5 w-5" />
                                        Add to List
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Seasons & Episodes Placeholder */}
                <div className="space-y-6 pt-8">
                    <h2 className="text-2xl font-bold">Saisons & Épisodes</h2>
                    {isLoadingEpisodes ? (
                        <p className="text-muted-foreground">Chargement des informations...</p>
                    ) : episodesData ? (
                        <div className="space-y-4">
                            {Object.keys(episodesData).map((lang) => (
                                <div key={lang} className="space-y-2">
                                    <h3 className="text-lg font-semibold uppercase">{lang}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.keys(episodesData[lang]).map((season) => (
                                            <div key={season} className="p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors">
                                                <h4 className="text-lg font-semibold mb-2">
                                                    {season.replace('saison', 'Saison ')}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {episodesData[lang][season].episodeCount} Épisodes
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Aucune information disponible</p>
                    )}
                </div>
            </div>

            <DownloadModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                animeTitle={anime.title}
                animeLanguages={anime.languages}
                episodesData={episodesData}
            />
        </>
    )
}
