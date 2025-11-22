import type { MediaItem } from "../types";

const API_URL = 'http://localhost:3001/api/watchlist';

export const storage = {
    getWatchlist: async (): Promise<MediaItem[]> => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error("Failed to fetch watchlist:", error);
            return [];
        }
    },

    addToWatchlist: async (item: MediaItem) => {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
        } catch (error) {
            console.error("Failed to add to watchlist:", error);
        }
    },

    removeFromWatchlist: async (id: string) => {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Failed to remove from watchlist:", error);
        }
    },

    isInWatchlist: async (id: string): Promise<boolean> => {
        const list = await storage.getWatchlist();
        return list.some(i => i.id === id);
    }
};
