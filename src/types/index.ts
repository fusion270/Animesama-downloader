export interface MediaItem {
    id: string;
    title: string;
    image: string;
    description: string;
    rating: number;
    episodes?: number;
    type: 'anime' | 'movie' | 'series';
    link?: string;
    languages?: string;
}

export interface DownloadItem {
    id: string;
    name: string;
    progress: number;
    size: string;
    status: 'active' | 'completed' | 'failed';
    speed?: string;
    eta?: string;
}

export interface AppSettings {
    downloadPath: string;
    simultaneousDownloads: number;
    proxies: string[];
}
