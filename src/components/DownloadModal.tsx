import { useState, useMemo } from "react"
import { X, Download, CheckSquare, Square } from "lucide-react"
import { Button } from "./ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../lib/utils"

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    animeTitle: string;
    animeLanguages?: string;
    episodesData?: any;
}

export function DownloadModal({ isOpen, onClose, animeTitle, animeLanguages = "VOSTFR", episodesData }: DownloadModalProps) {
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selections, setSelections] = useState<Record<number, number[]>>({});

    // Parse available languages
    const availableLanguages = animeLanguages.split(',').map(l => l.trim()).filter(Boolean);
    const [selectedLanguage, setSelectedLanguage] = useState(availableLanguages[0] || "VOSTFR");

    // Get real data from episodesData
    const seasons = useMemo(() => {
        if (!episodesData || !episodesData[selectedLanguage.toLowerCase()]) return [1, 2, 3, 4]; // fallback
        return Object.keys(episodesData[selectedLanguage.toLowerCase()]).map((_, idx) => idx + 1);
    }, [episodesData, selectedLanguage]);

    const episodesPerSeason = useMemo(() => {
        if (!episodesData || !episodesData[selectedLanguage.toLowerCase()]) return 12; // fallback
        const seasonKey = `saison${selectedSeason}`;
        return episodesData[selectedLanguage.toLowerCase()][seasonKey]?.episodeCount || 12;
    }, [episodesData, selectedLanguage, selectedSeason]);

    const currentSeasonEpisodes = useMemo(() => selections[selectedSeason] || [], [selections, selectedSeason]);

    const toggleEpisode = (ep: number) => {
        setSelections(prev => {
            const current = prev[selectedSeason] || [];
            const updated = current.includes(ep)
                ? current.filter(e => e !== ep)
                : [...current, ep];
            return { ...prev, [selectedSeason]: updated };
        });
    };

    const toggleAll = () => {
        setSelections(prev => {
            const current = prev[selectedSeason] || [];
            if (current.length === episodesPerSeason) {
                return { ...prev, [selectedSeason]: [] };
            } else {
                return { ...prev, [selectedSeason]: Array.from({ length: episodesPerSeason }, (_, i) => i + 1) };
            }
        });
    };

    const totalSelected = Object.values(selections).reduce((acc, curr) => acc + curr.length, 0);

    const handleDownload = async () => {
        if (totalSelected === 0) return;

        try {
            // Get episode links from episodesData
            const downloads = [];

            for (const [season, episodes] of Object.entries(selections)) {
                const seasonNum = parseInt(season);
                const seasonKey = `saison${seasonNum}`;
                const langKey = selectedLanguage.toLowerCase();

                if (!episodesData || !episodesData[langKey] || !episodesData[langKey][seasonKey]) {
                    console.error(`No episode data for ${langKey} - ${seasonKey}`);
                    continue;
                }

                const seasonData = episodesData[langKey][seasonKey];
                const episodeLinks = seasonData.episodes;

                for (const episodeNum of episodes) {
                    const sibnetUrl = episodeLinks[episodeNum - 1]; // arrays are 0-indexed

                    if (sibnetUrl) {
                        downloads.push({
                            animeTitle,
                            season: seasonNum,
                            episode: episodeNum,
                            sibnetUrl,
                            language: selectedLanguage
                        });
                    }
                }
            }

            console.log(`Sending ${downloads.length} episodes to download queue...`);

            // Send all downloads to backend
            for (const download of downloads) {
                await fetch('http://localhost:3001/api/add-download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(download)
                });
            }

            alert(`${downloads.length} épisodes ont été ajoutés à la file de téléchargement !`);
            onClose();

        } catch (error) {
            console.error('Error adding downloads:', error);
            alert('Erreur lors de l\'ajout des téléchargements');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
                    >
                        <div className="bg-card w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border border-border pointer-events-auto flex flex-col overflow-hidden">

                            {/* Header */}
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                                <div>
                                    <h2 className="text-2xl font-bold">Sélection de téléchargement</h2>
                                    <p className="text-muted-foreground text-sm">Sélectionnez les épisodes à télécharger de <span className="text-primary font-semibold">{animeTitle}</span></p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar - Seasons */}
                                <div className="w-48 border-r border-border bg-secondary/10 overflow-y-auto p-2 space-y-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Saisons
                                    </div>
                                    {seasons.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSeason(s)}
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center",
                                                selectedSeason === s
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            Saison {s}
                                            {(selections[s]?.length || 0) > 0 && (
                                                <span className={cn(
                                                    "text-xs px-1.5 py-0.5 rounded-full",
                                                    selectedSeason === s ? "bg-white/20" : "bg-primary/10 text-primary"
                                                )}>
                                                    {selections[s].length}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Content - Episodes */}
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
                                        <div className="flex items-center gap-4">
                                            <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs">
                                                {currentSeasonEpisodes.length === episodesPerSeason ? (
                                                    <CheckSquare className="mr-2 h-4 w-4 text-primary" />
                                                ) : (
                                                    <Square className="mr-2 h-4 w-4" />
                                                )}
                                                Tout sélectionner (S{selectedSeason})
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                {currentSeasonEpisodes.length} sélectionné(s)
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Langue:</span>
                                            <select
                                                className="bg-secondary border-none text-xs rounded-md px-2 py-1 focus:ring-1 focus:ring-primary"
                                                value={selectedLanguage}
                                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                            >
                                                {availableLanguages.map(lang => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Array.from({ length: episodesPerSeason }, (_, i) => i + 1).map(ep => {
                                                const isSelected = currentSeasonEpisodes.includes(ep);
                                                return (
                                                    <div
                                                        key={ep}
                                                        onClick={() => toggleEpisode(ep)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none",
                                                            isSelected
                                                                ? "bg-primary/10 border-primary"
                                                                : "bg-card border-border hover:border-primary/50"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                                                        )}>
                                                            {isSelected && <CheckSquare className="w-3.5 h-3.5 text-primary-foreground" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">Épisode {ep}</p>
                                                            <p className="text-xs text-muted-foreground">24 min • 350 MB</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border bg-background flex justify-end gap-3">
                                <Button variant="ghost" onClick={onClose}>Annuler</Button>
                                <Button
                                    onClick={handleDownload}
                                    disabled={totalSelected === 0}
                                    className="w-40"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger ({totalSelected})
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
