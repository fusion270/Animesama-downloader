import { useState, useEffect } from 'react';
import { Download, Pause, Play, Trash2, FolderOpen, AlertCircle, Film, Clock, HardDrive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DownloadItem {
    id: number;
    animeTitle: string;
    season: number;
    episode: number;
    language: string;
    status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    speed?: number; // bytes per second
    totalSize?: number; // bytes
    downloadedSize?: number; // bytes
    outputPath: string;
    error?: string;
}

export function Downloads() {
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchDownloads = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/downloads');
            if (!response.ok) {
                throw new Error('Failed to fetch downloads');
            }
            const data = await response.json();
            setDownloads(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching downloads:', err);
            if (downloads.length === 0) {
                setError('Could not connect to download server');
            }
        }
    };

    useEffect(() => {
        fetchDownloads();
        const interval = setInterval(fetchDownloads, 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePauseResume = async (id: number, currentStatus: string) => {
        try {
            const endpoint = currentStatus === 'downloading'
                ? `http://localhost:3001/api/download/${id}/pause`
                : `http://localhost:3001/api/download/${id}/resume`;

            const response = await fetch(endpoint, { method: 'POST' });

            if (response.ok) {
                fetchDownloads();
            } else {
                console.error('Failed to toggle pause/resume');
            }
        } catch (err) {
            console.error('Error toggling pause/resume:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to cancel/delete this download?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/download/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchDownloads();
            } else {
                console.error('Failed to delete download');
            }
        } catch (err) {
            console.error('Error deleting download:', err);
        }
    };

    const handleOpenFolder = async (path: string) => {
        try {
            const separator = path.includes('\\') ? '\\' : '/';
            const folderPath = path.substring(0, path.lastIndexOf(separator));

            await fetch('http://localhost:3001/api/open-folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: folderPath })
            });
        } catch (err) {
            console.error('Error opening folder:', err);
        }
    };

    const formatBytes = (bytes?: number) => {
        if (bytes === undefined || bytes === null) return '0 B';
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatSpeed = (bytesPerSec?: number) => {
        if (!bytesPerSec) return '0 B/s';
        return `${formatBytes(bytesPerSec)}/s`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'downloading': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'paused': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'queued': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'downloading': return 'bg-blue-500';
            case 'paused': return 'bg-yellow-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-purple-500';
        }
    };

    return (
        <div className="space-y-8 p-2">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <Download className="w-6 h-6 text-primary" />
                    </div>
                    Downloads
                </h1>
                <p className="text-muted-foreground ml-12">
                    Manage your active and completed downloads.
                </p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center gap-3"
                >
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </motion.div>
            )}

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {downloads.length === 0 && !error ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border"
                        >
                            <div className="p-4 bg-secondary/50 rounded-full mb-4">
                                <Download className="w-12 h-12 opacity-50" />
                            </div>
                            <p className="text-lg font-medium">No downloads yet</p>
                            <p className="text-sm opacity-70">Start watching an anime to download episodes</p>
                        </motion.div>
                    ) : (
                        downloads.map((download) => (
                            <motion.div
                                key={download.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative overflow-hidden bg-secondary/30 backdrop-blur-sm border border-border/50 rounded-xl p-5 transition-all hover:bg-secondary/40 hover:border-border/80 hover:shadow-lg"
                            >
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className={`p-3 rounded-xl ${getStatusColor(download.status)}`}>
                                            {download.status === 'downloading' ? (
                                                <Download className="w-6 h-6 animate-bounce" />
                                            ) : download.status === 'completed' ? (
                                                <Film className="w-6 h-6" />
                                            ) : download.status === 'paused' ? (
                                                <Pause className="w-6 h-6" />
                                            ) : (
                                                <AlertCircle className="w-6 h-6" />
                                            )}
                                        </div>

                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-bold text-lg truncate pr-4" title={download.animeTitle}>
                                                    {download.animeTitle}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(download.status)}`}>
                                                    {download.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Film className="w-3.5 h-3.5" />
                                                    S{download.season} • E{download.episode}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <HardDrive className="w-3.5 h-3.5" />
                                                    {formatBytes(download.downloadedSize)} / {download.totalSize ? formatBytes(download.totalSize) : '--'}
                                                </span>
                                                {download.status === 'downloading' && (
                                                    <span className="flex items-center gap-1.5 text-blue-400">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatSpeed(download.speed)}
                                                    </span>
                                                )}
                                            </div>

                                            {download.error && (
                                                <p className="text-xs text-red-400 mt-1 font-medium">
                                                    {download.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                        {download.status === 'completed' ? (
                                            <button
                                                onClick={() => handleOpenFolder(download.outputPath)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors font-medium text-sm border border-blue-600/20"
                                            >
                                                <FolderOpen className="w-4 h-4" />
                                                Open Folder
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handlePauseResume(download.id, download.status)}
                                                disabled={download.status === 'queued' || download.status === 'failed'}
                                                className={`p-2.5 rounded-lg transition-colors border ${download.status === 'queued' || download.status === 'failed'
                                                    ? 'opacity-50 cursor-not-allowed bg-secondary text-muted-foreground border-transparent'
                                                    : 'bg-secondary hover:bg-secondary/80 border-border hover:border-primary/50 text-foreground'
                                                    }`}
                                                title={download.status === 'downloading' ? 'Pause' : 'Resume'}
                                            >
                                                {download.status === 'paused' ? (
                                                    <Play className="w-5 h-5 fill-current" />
                                                ) : (
                                                    <Pause className="w-5 h-5 fill-current" />
                                                )}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDelete(download.id)}
                                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                                            title="Cancel/Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4 relative h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${download.progress}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                        className={`absolute top-0 left-0 h-full rounded-full ${getProgressBarColor(download.status)}`}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5 text-xs font-medium text-muted-foreground">
                                    <span>{Math.round(download.progress)}%</span>
                                    <span>{download.status === 'downloading' ? 'Downloading...' : download.status === 'paused' ? 'Paused' : download.status === 'completed' ? 'Completed' : 'Waiting...'}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
