# Animesama Downloader

A modern desktop application for downloading animes from Anime-Sama with an elegant dark UI and powerful features.

## ✨ Features

### 🎬 Catalog Browser
- Browse the complete Anime-Sama catalog
- Real-time search and filtering
- Featured anime showcase
- Detailed anime information pages

### 📅 Planning View
- Weekly release schedule from Anime-Sama
- Filters to show only downloaded animes
- Landscape card design for better readability
- Direct navigation to anime details

### ⬇️ Download Manager
- Queue-based download system
- Pause/Resume functionality
- Customizable file naming templates
- Simultaneous download control
- Real-time progress tracking

### ⚙️ Settings
- Custom download directory
- Flexible file and folder naming patterns
- Presets for popular media servers (Plex, Jellyfin)
- Proxy support with file import
- Performance tuning

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup
```bash
cd server
npm install
node index.js
```

The backend will start on `http://localhost:3001`

### Frontend Setup
```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📖 Usage

1. **Update Catalog**: Click "Update List" on the Animesama page to fetch the latest catalog
2. **Browse Animes**: Use the search bar or scroll through the catalog
3. **Download Episodes**: Click on an anime → Select episodes → Choose language → Download
4. **View Planning**: Click the "Planning" button to see your downloaded animes' weekly schedule
5. **Manage Downloads**: Navigate to the Downloads page to monitor and control your downloads

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Backend
- Node.js + Express
- Puppeteer (web scraping)
- File system management

## 📁 Project Structure

```
animesama-downloaderV9999/
├── server/              # Backend server
│   ├── index.js        # Main server file
│   └── package.json    # Backend dependencies
├── src/                # Frontend source
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── types/         # TypeScript types
│   └── lib/           # Utilities
├── public/            # Static assets
└── package.json       # Frontend dependencies
```

## ⚙️ Configuration

### Download Path Templates

The application supports dynamic file naming using variables:

**Available Variables:**
- `{animeTitle}` - Name of the anime
- `{season}` - Season number
- `{seasonPad}` - Zero-padded season (e.g., 01)
- `{episode}` - Episode number
- `{episodePad}` - Zero-padded episode (e.g., 01)
- `{language}` - Audio language (vostfr, vf)
- `{year}` - Release year

**Example:**
```
Folder: {animeTitle}/Season {season}
File: {animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4
Result: One Piece/Season 1/One Piece - S01E01 [vostfr].mp4
```

## 🔒 Privacy & Legal

This application is for personal use only. Please respect copyright laws and the terms of service of Anime-Sama.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is for educational purposes only.

## 🙏 Acknowledgments

- Anime-Sama for providing the content
- The open-source community for the amazing tools and libraries

---

Made with ❤️ by fusion270
