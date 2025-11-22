import { useState, useEffect } from "react"
import { FolderOpen, Upload, Save, Check, RefreshCw, Download, FileText, Zap, Globe, Settings as SettingsIcon } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { FileBrowser } from "../components/FileBrowser"

interface Settings {
    downloadPath: string;
    simultaneousDownloads: number;
    proxies: string[];
    folderTemplate: string;
    filenameTemplate: string;
}

const PRESETS = [
    {
        name: "Par défaut (Recommandé)",
        folder: "{animeTitle}/Season {season}",
        filename: "{animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4"
    },
    {
        name: "Dossier Anime uniquement",
        folder: "{animeTitle}",
        filename: "S{seasonPad}E{episodePad} - {animeTitle}.mp4"
    },
    {
        name: "Plat (Tout dans le même dossier)",
        folder: "",
        filename: "{animeTitle} - S{seasonPad}E{episodePad}.mp4"
    },
    {
        name: "Plex / Jellyfin",
        folder: "{animeTitle} ({year})/Season {seasonPad}",
        filename: "{animeTitle} - S{seasonPad}E{episodePad}.mp4"
    }
];

export function Settings() {
    const [settings, setSettings] = useState<Settings>({
        downloadPath: "",
        simultaneousDownloads: 3,
        proxies: [],
        folderTemplate: "{animeTitle}/Season {season}",
        filenameTemplate: "{animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4"
    });
    const [proxiesText, setProxiesText] = useState("");
    const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/settings');
            const data = await response.json();
            setSettings({
                ...data,
                folderTemplate: data.folderTemplate || "{animeTitle}/Season {season}",
                filenameTemplate: data.filenameTemplate || "{animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4"
            });
            setProxiesText(data.proxies.join('\n'));
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        try {
            // Parse proxies from textarea
            const proxiesList = proxiesText
                .split('\n')
                .map(p => p.trim())
                .filter(p => p.length > 0);

            const updatedSettings = {
                ...settings,
                proxies: proxiesList
            };

            const response = await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedSettings)
            });

            const data = await response.json();
            if (data.success) {
                setSettings(data.settings);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const handlePathSelect = (path: string) => {
        setSettings({ ...settings, downloadPath: path });
    };

    const importProxiesFromFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const text = event.target?.result as string;
                    setProxiesText(text);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const applyPreset = (presetName: string) => {
        const preset = PRESETS.find(p => p.name === presetName);
        if (preset) {
            setSettings({
                ...settings,
                folderTemplate: preset.folder,
                filenameTemplate: preset.filename
            });
        }
    };

    const getPreview = () => {
        const sampleData = {
            animeTitle: "One Piece",
            season: "1",
            seasonPad: "01",
            episode: "1",
            episodePad: "01",
            language: "vostfr",
            year: "1999"
        };

        let folder = settings.folderTemplate;
        let filename = settings.filenameTemplate;

        Object.entries(sampleData).forEach(([key, value]) => {
            folder = folder.replace(new RegExp(`{${key}}`, 'g'), value);
            filename = filename.replace(new RegExp(`{${key}}`, 'g'), value);
        });

        // Clean up slashes
        const fullPath = `${settings.downloadPath}\\${folder}\\${filename}`.replace(/\\+/g, '\\');
        return fullPath;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Chargement des paramètres...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 pb-24">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <SettingsIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
                        <p className="text-muted-foreground">Gérez vos préférences de téléchargement et de réseau.</p>
                    </div>
                </div>

                <div className="grid gap-8">
                    {/* Download Path Card */}
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Download className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold">Localisation</h3>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-muted-foreground">Dossier de téléchargement</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        value={settings.downloadPath}
                                        onChange={(e) => setSettings({ ...settings, downloadPath: e.target.value })}
                                        className="font-mono text-sm pl-10 bg-secondary/50 border-transparent focus:bg-background transition-all"
                                        placeholder="C:\Downloads\Animes"
                                    />
                                    <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsFileBrowserOpen(true)}
                                    className="shrink-0"
                                >
                                    Parcourir
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground ml-1">
                                Tous vos épisodes seront sauvegardés ici. Assurez-vous d'avoir suffisamment d'espace disque.
                            </p>
                        </div>
                    </div>

                    {/* File Customization Card */}
                    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold">Nommage des fichiers</h3>
                            </div>
                            <select
                                className="text-xs bg-secondary border-transparent rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:bg-secondary/80 transition-colors"
                                onChange={(e) => applyPreset(e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Charger un préréglage...</option>
                                {PRESETS.map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Structure des dossiers</label>
                                    <Input
                                        value={settings.folderTemplate}
                                        onChange={(e) => setSettings({ ...settings, folderTemplate: e.target.value })}
                                        className="font-mono text-sm bg-secondary/50 border-transparent focus:bg-background"
                                        placeholder="{animeTitle}/Season {season}"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Nom du fichier</label>
                                    <Input
                                        value={settings.filenameTemplate}
                                        onChange={(e) => setSettings({ ...settings, filenameTemplate: e.target.value })}
                                        className="font-mono text-sm bg-secondary/50 border-transparent focus:bg-background"
                                        placeholder="{animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4"
                                    />
                                </div>
                            </div>

                            <div className="bg-[#0f172a] rounded-xl p-4 border border-white/5 flex flex-col">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <RefreshCw className="w-3 h-3" /> Aperçu en temps réel
                                </h4>
                                <div className="flex-1 flex items-center">
                                    <code className="text-xs md:text-sm font-mono text-green-400 break-all leading-relaxed">
                                        {getPreview()}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Variables disponibles:</span> {'{animeTitle}'}, {'{season}'}, {'{seasonPad}'}, {'{episode}'}, {'{episodePad}'}, {'{language}'}, {'{year}'}
                            </p>
                        </div>
                    </div>

                    {/* Performance & Network Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Performance Card */}
                        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-semibold">Performance</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-muted-foreground">Téléchargements simultanés</label>
                                    <span className="text-lg font-bold text-primary">
                                        {settings.simultaneousDownloads}
                                    </span>
                                </div>
                                <div className="relative pt-2">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={settings.simultaneousDownloads}
                                        onChange={(e) => setSettings({ ...settings, simultaneousDownloads: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                                        <span>1</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Augmenter cette valeur permet de télécharger plus de fichiers en même temps, mais peut ralentir votre connexion internet.
                                </p>
                            </div>
                        </div>

                        {/* Proxies Card */}
                        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Proxies</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={importProxiesFromFile}
                                    className="h-8 text-xs"
                                >
                                    <Upload className="mr-2 h-3 w-3" />
                                    Importer
                                </Button>
                            </div>

                            <textarea
                                className="flex-1 w-full min-h-[120px] rounded-lg border-transparent bg-secondary/50 px-3 py-2 text-xs font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none transition-all focus:bg-background"
                                placeholder={`http://user:pass@ip:port\nsocks5://ip:port`}
                                value={proxiesText}
                                onChange={(e) => setProxiesText(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-3 text-right">
                                {settings.proxies.length} proxy{settings.proxies.length !== 1 ? 's' : ''} actif{settings.proxies.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Save Bar */}
            <div className="fixed bottom-0 left-64 right-0 p-6 bg-background/80 backdrop-blur-md border-t border-border/50 flex justify-end items-center gap-4 z-40">
                <p className="text-sm text-muted-foreground hidden md:block">
                    N'oubliez pas de sauvegarder vos changements.
                </p>
                <Button
                    size="lg"
                    className={`min-w-[200px] shadow-lg transition-all duration-300 ${saved ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    onClick={saveSettings}
                    disabled={saved}
                >
                    {saved ? (
                        <>
                            <Check className="mr-2 h-5 w-5" />
                            Paramètres sauvegardés
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-5 w-5" />
                            Sauvegarder
                        </>
                    )}
                </Button>
            </div>

            <FileBrowser
                isOpen={isFileBrowserOpen}
                onClose={() => setIsFileBrowserOpen(false)}
                onSelectPath={handlePathSelect}
                initialPath={settings.downloadPath}
            />
        </>
    )
}
