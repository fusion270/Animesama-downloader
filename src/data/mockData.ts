import type { MediaItem, DownloadItem } from "../types";

export const mockAnimes: MediaItem[] = [
    {
        id: '1',
        title: 'Jujutsu Kaisen',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.',
        rating: 4.8,
        episodes: 24,
        type: 'anime'
    },
    {
        id: '2',
        title: 'Demon Slayer',
        image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'A family is attacked by demons and only two members survive.',
        rating: 4.9,
        episodes: 26,
        type: 'anime'
    },
    {
        id: '3',
        title: 'One Piece',
        image: 'https://images.unsplash.com/photo-1562159278-1253a58da141?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'Follows the adventures of Monkey D. Luffy and his pirate crew.',
        rating: 4.7,
        episodes: 1000,
        type: 'anime'
    },
    {
        id: '4',
        title: 'Attack on Titan',
        image: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'Humanity lives inside cities surrounded by enormous walls.',
        rating: 4.9,
        episodes: 80,
        type: 'anime'
    },
    {
        id: '5',
        title: 'Chainsaw Man',
        image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita.',
        rating: 4.6,
        episodes: 12,
        type: 'anime'
    }
];

export const mockMovies: MediaItem[] = [
    {
        id: '1',
        title: 'Inception',
        image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        rating: 4.8,
        type: 'movie'
    },
    {
        id: '2',
        title: 'Interstellar',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'A team of explorers travel through a wormhole in space.',
        rating: 4.9,
        type: 'movie'
    },
    {
        id: '3',
        title: 'The Dark Knight',
        image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
        rating: 4.9,
        type: 'movie'
    },
    {
        id: '4',
        title: 'Stranger Things',
        image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=1600&h=900',
        description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.',
        rating: 4.7,
        type: 'series'
    }
];

export const mockDownloads: DownloadItem[] = [
    {
        id: '1',
        name: 'Jujutsu Kaisen - Episode 12',
        progress: 45,
        size: '1.2 GB',
        status: 'active',
        speed: '2.5 MB/s',
        eta: '5 min'
    },
    {
        id: '2',
        name: 'One Piece - Episode 1071',
        progress: 12,
        size: '850 MB',
        status: 'active',
        speed: '1.8 MB/s',
        eta: '12 min'
    },
    {
        id: '3',
        name: 'Interstellar (1080p)',
        progress: 100,
        size: '4.5 GB',
        status: 'completed'
    },
    {
        id: '4',
        name: 'Attack on Titan - Final Season',
        progress: 100,
        size: '12.4 GB',
        status: 'completed'
    },
    {
        id: '5',
        name: 'Unknown Movie',
        progress: 0,
        size: '2.1 GB',
        status: 'failed'
    }
];
