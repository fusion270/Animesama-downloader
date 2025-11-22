const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');
const CATALOG_FILE = path.join(__dirname, 'catalog.json');

app.use(cors());
app.use(bodyParser.json());

// Helper to read DB
const readDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        return { watchlist: [] };
    }
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
};

// Helper to write DB
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Helper to read Catalog
const readCatalog = () => {
    if (!fs.existsSync(CATALOG_FILE)) {
        return [];
    }
    const data = fs.readFileSync(CATALOG_FILE);
    return JSON.parse(data);
};

// Helper to write Catalog
const writeCatalog = (data) => {
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(data, null, 2));
};

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
    writeDb({ watchlist: [] });
}

// GET Watchlist
app.get('/api/watchlist', (req, res) => {
    const db = readDb();
    res.json(db.watchlist);
});

// ADD to Watchlist
app.post('/api/watchlist', (req, res) => {
    const item = req.body;
    const db = readDb();

    if (!db.watchlist.some(i => i.id === item.id)) {
        db.watchlist.push(item);
        writeDb(db);
    }

    res.json(db.watchlist);
});

// REMOVE from Watchlist
app.delete('/api/watchlist/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();

    db.watchlist = db.watchlist.filter(i => i.id !== id);
    writeDb(db);

    res.json(db.watchlist);
});

// GET Catalog
app.get('/api/catalog', (req, res) => {
    const catalog = readCatalog();
    res.json(catalog);
});

// UPDATE Catalog (Scrape)
app.post('/api/update-catalog', async (req, res) => {
    console.log('Starting catalog update...');
    const allAnimes = [];

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled"
        ]
    });

    try {
        for (let pageNum = 1; pageNum <= 39; pageNum++) {
            console.log(`Scraping page ${pageNum}...`);
            const page = await browser.newPage();
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36");

            await page.goto(`https://anime-sama.org/catalogue/?page=${pageNum}`, {
                waitUntil: "networkidle2",
                timeout: 60000
            });

            const animes = await page.$$eval('.card-base', cards => {
                return cards.map(card => {
                    const getText = (selector) => {
                        const el = card.querySelector(selector);
                        return el ? el.textContent.trim() : '';
                    };
                    const getAttr = (selector, attr) => {
                        const el = card.querySelector(selector);
                        return el ? el.getAttribute(attr) : '';
                    };

                    const typeLabel = Array.from(card.querySelectorAll('.info-label')).find(el => el.textContent.includes('Types'));
                    let types = '';
                    if (typeLabel) {
                        const next = typeLabel.nextElementSibling;
                        if (next && next.classList.contains('info-value')) {
                            types = next.textContent.trim();
                        }
                    }

                    if (!types.includes('Anime')) return null;

                    const langLabel = Array.from(card.querySelectorAll('.info-label')).find(el => el.textContent.includes('Langues'));
                    let languages = '';
                    if (langLabel) {
                        const next = langLabel.nextElementSibling;
                        if (next && next.classList.contains('info-value')) {
                            languages = next.textContent.trim();
                        }
                    }

                    const title = getText('.card-title');
                    const image = getAttr('.card-image', 'src');
                    const description = getText('.synopsis-content');
                    const link = getAttr('a', 'href');
                    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                    return {
                        id,
                        title,
                        image,
                        description,
                        rating: 0,
                        episodes: 0,
                        type: 'anime',
                        link,
                        languages
                    };
                }).filter(Boolean);
            });

            console.log(`Page ${pageNum}: Found ${animes.length} animes, first one has language: ${animes[0]?.languages || 'NONE'}`);
            allAnimes.push(...animes);
            await page.close();
        }

        await browser.close();
        console.log(`Scraping complete. Found ${allAnimes.length} animes.`);
        writeCatalog(allAnimes);
        res.json({ success: true, count: allAnimes.length, data: allAnimes });

    } catch (error) {
        await browser.close();
        console.error('Scraping failed:', error);
        res.status(500).json({ error: 'Scraping failed' });
    }
});

// GET Episodes for an anime
app.post('/api/anime-episodes', async (req, res) => {
    const { animeLink, languages } = req.body;

    if (!animeLink) {
        return res.status(400).json({ error: 'animeLink is required' });
    }

    console.log(`\n=== FETCHING EPISODES ===`);
    console.log(`Link: ${animeLink}`);
    console.log(`Languages: ${languages}`);

    try {
        const animeSlug = animeLink.replace('https://anime-sama.org/catalogue/', '').replace(/\/$/, '');
        console.log(`Slug: ${animeSlug}`);

        const availableLanguages = languages ? languages.split(',').map(l => l.trim().toLowerCase()) : ['vostfr'];
        console.log(`Parsed languages: ${availableLanguages.join(', ')}`);

        const episodesData = {};

        for (const lang of availableLanguages) {
            console.log(`\n--- Processing language: ${lang.toUpperCase()} ---`);
            episodesData[lang] = {};
            let seasonNum = 1;
            let foundSeasons = true;

            while (foundSeasons && seasonNum <= 5) {
                const episodesUrl = `https://anime-sama.org/catalogue/${animeSlug}/saison${seasonNum}/${lang}/episodes.js`;
                console.log(`  [Season ${seasonNum}] URL: ${episodesUrl}`);

                try {
                    const response = await axios.get(episodesUrl, {
                        timeout: 5000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    const content = response.data;
                    console.log(`  [Season ${seasonNum}] Status: ${response.status}, Length: ${content?.length || 0}`);

                    if (!content || content.trim().length === 0 || !content.includes('var eps')) {
                        console.log(`  [Season ${seasonNum}] No valid content, stopping`);
                        foundSeasons = false;
                        break;
                    }

                    const sibnetLinks = [];
                    const matches = content.matchAll(/https:\/\/video\.sibnet\.ru\/shell\.php\?videoid=\d+/g);

                    for (const match of matches) {
                        sibnetLinks.push(match[0]);
                    }

                    console.log(`  [Season ${seasonNum}] Found ${sibnetLinks.length} episodes`);

                    if (sibnetLinks.length > 0) {
                        episodesData[lang][`saison${seasonNum}`] = {
                            episodes: sibnetLinks,
                            episodeCount: sibnetLinks.length
                        };
                        seasonNum++;
                    } else {
                        console.log(`  [Season ${seasonNum}] No episodes, stopping`);
                        foundSeasons = false;
                    }
                } catch (error) {
                    console.log(`  [Season ${seasonNum}] Error: ${error.message}`);
                    foundSeasons = false;
                }
            }

            console.log(`--- ${lang.toUpperCase()} complete: ${Object.keys(episodesData[lang]).length} seasons`);
        }

        console.log(`\n=== FETCH COMPLETE ===\n`);

        res.json({
            success: true,
            animeSlug,
            episodes: episodesData
        });

    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).json({ error: 'Failed to fetch episodes', message: error.message });
    }
});

// Settings management
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const defaultSettings = {
    downloadPath: path.join(__dirname, 'downloads'),
    simultaneousDownloads: 3,
    proxies: [],
    folderTemplate: "{animeTitle}/Season {season}",
    filenameTemplate: "{animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4"
};

// Helper to read settings
const readSettings = () => {
    if (!fs.existsSync(SETTINGS_FILE)) {
        writeSettings(defaultSettings);
        return defaultSettings;
    }
    const data = fs.readFileSync(SETTINGS_FILE);
    return JSON.parse(data);
};

// Helper to write settings
const writeSettings = (settings) => {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
};

// GET Settings
app.get('/api/settings', (req, res) => {
    const settings = readSettings();
    res.json(settings);
});

// POST Settings
app.post('/api/settings', (req, res) => {
    const settings = req.body;
    writeSettings(settings);
    res.json({ success: true, settings });
});

// File browser - list directories
app.post('/api/browse-directory', (req, res) => {
    let { dirPath } = req.body;

    // If no path provided, start from server directory
    if (!dirPath) {
        dirPath = __dirname;
    }

    console.log(`Browsing directory: ${dirPath}`);

    try {
        // Check if directory exists
        if (!fs.existsSync(dirPath)) {
            return res.status(404).json({ error: 'Directory not found' });
        }

        // Check if it's a directory
        const stats = fs.statSync(dirPath);
        if (!stats.isDirectory()) {
            return res.status(400).json({ error: 'Path is not a directory' });
        }

        // Read directory contents
        const items = fs.readdirSync(dirPath);

        const directories = [];
        const files = [];

        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            try {
                const itemStats = fs.statSync(itemPath);
                const itemData = {
                    name: item,
                    path: itemPath,
                    isDirectory: itemStats.isDirectory(),
                    size: itemStats.size,
                    modified: itemStats.mtime
                };

                if (itemStats.isDirectory()) {
                    directories.push(itemData);
                } else {
                    files.push(itemData);
                }
            } catch (err) {
                // Skip items we can't access
                console.log(`Skipping ${item}: ${err.message}`);
            }
        });

        // Sort directories and files alphabetically
        directories.sort((a, b) => a.name.localeCompare(b.name));
        files.sort((a, b) => a.name.localeCompare(b.name));

        // Get parent directory
        const parentDir = path.dirname(dirPath);

        res.json({
            currentPath: dirPath,
            parentPath: parentDir !== dirPath ? parentDir : null,
            directories,
            files
        });

    } catch (error) {
        console.error('Error browsing directory:', error);
        res.status(500).json({ error: 'Failed to browse directory', message: error.message });
    }
});

// Create directory
app.post('/api/create-directory', (req, res) => {
    const { dirPath, folderName } = req.body;

    if (!dirPath || !folderName) {
        return res.status(400).json({ error: 'dirPath and folderName are required' });
    }

    const newDirPath = path.join(dirPath, folderName);

    try {
        if (fs.existsSync(newDirPath)) {
            return res.status(400).json({ error: 'Directory already exists' });
        }

        fs.mkdirSync(newDirPath, { recursive: true });
        console.log(`Created directory: ${newDirPath}`);

        res.json({ success: true, path: newDirPath });
    } catch (error) {
        console.error('Error creating directory:', error);
        res.status(500).json({ error: 'Failed to create directory', message: error.message });
    }
});

// Download Queue System
const downloadQueue = [];
const activeDownloads = new Map(); // downloadId -> download info
let downloadIdCounter = 1;

// Get random proxy from settings
const getRandomProxy = () => {
    const settings = readSettings();
    if (!settings.proxies || settings.proxies.length === 0) {
        return null;
    }
    const randomIndex = Math.floor(Math.random() * settings.proxies.length);
    return settings.proxies[randomIndex];
};

// Parse proxy URL to axios config
const parseProxyConfig = (proxyUrl) => {
    if (!proxyUrl) return null;

    try {
        const url = new URL(proxyUrl);
        return {
            protocol: url.protocol.replace(':', ''),
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'http:' ? 80 : 1080),
            auth: url.username && url.password ? {
                username: url.username,
                password: url.password
            } : undefined
        };
    } catch (error) {
        console.error('Invalid proxy URL:', proxyUrl);
        return null;
    }
};

// Extract MP4 URL from Sibnet page
const extractMp4UrlFromSibnet = async (sibnetUrl, proxyUrl = null) => {
    try {
        console.log(`Extracting MP4 from: ${sibnetUrl}${proxyUrl ? ` via proxy ${proxyUrl}` : ''}`);

        const config = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                'Referer': 'https://video.sibnet.ru/',
            }
        };

        // Add proxy if provided
        if (proxyUrl) {
            const proxyConfig = parseProxyConfig(proxyUrl);
            if (proxyConfig) {
                config.proxy = proxyConfig;
            }
        }

        const response = await axios.get(sibnetUrl, config);
        const html = response.data;

        // Search for player.src pattern
        const pattern = /player\.src\(\[\{src:\s*"([^"]+)",\s*type:\s*"video\/mp4"\}/;
        const match = html.match(pattern);

        if (match && match[1]) {
            const mp4Path = match[1];
            const fullUrl = `https://video.sibnet.ru${mp4Path}`;
            console.log(`Extracted MP4 URL: ${fullUrl}`);
            return fullUrl;
        }

        console.error('Could not extract MP4 URL from page');
        return null;
    } catch (error) {
        console.error('Error extracting MP4 URL:', error.message);
        return null;
    }
};

// Download a single file
const downloadFile = async (downloadId, mp4Url, outputPath, onProgress, proxyUrl = null, downloadObj = null) => {
    try {
        let startByte = 0;
        if (fs.existsSync(outputPath)) {
            startByte = fs.statSync(outputPath).size;
        }

        console.log(`Starting download ${downloadId}: ${mp4Url} (Resume from: ${startByte})${proxyUrl ? ` via proxy ${proxyUrl}` : ''}`);

        const controller = new AbortController();
        if (downloadObj) {
            downloadObj.abortController = controller;
        }

        const config = {
            method: 'GET',
            url: mp4Url,
            responseType: 'stream',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
                'Referer': 'https://video.sibnet.ru/',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive',
            }
        };

        if (startByte > 0) {
            config.headers['Range'] = `bytes=${startByte}-`;
        }

        // Add proxy if provided
        if (proxyUrl) {
            const proxyConfig = parseProxyConfig(proxyUrl);
            if (proxyConfig) {
                config.proxy = proxyConfig;
            }
        }

        const response = await axios(config);

        const isPartial = response.status === 206;
        // If we requested a range but got 200, it means server doesn't support it or sent full file.
        if (startByte > 0 && !isPartial) {
            console.log(`Server returned 200 OK instead of 206 Partial Content. Restarting download ${downloadId} from beginning.`);
            startByte = 0;
        }

        const totalSize = parseInt(response.headers['content-length'], 10) + startByte;
        let downloadedSize = startByte;
        let lastDownloadedSize = startByte;
        let lastTime = Date.now();
        let speed = 0; // bytes per second

        // Create write stream (append mode if partial, otherwise overwrite)
        const writer = fs.createWriteStream(outputPath, { flags: startByte > 0 ? 'a' : 'w' });

        // Track progress
        response.data.on('data', (chunk) => {
            downloadedSize += chunk.length;

            // Calculate speed every ~1 second
            const now = Date.now();
            const timeDiff = now - lastTime;
            if (timeDiff >= 1000) {
                const sizeDiff = downloadedSize - lastDownloadedSize;
                speed = (sizeDiff / timeDiff) * 1000; // bytes per second

                lastTime = now;
                lastDownloadedSize = downloadedSize;
            }

            const progress = (downloadedSize / totalSize) * 100;
            onProgress(downloadId, progress, downloadedSize, totalSize, speed);
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Download ${downloadId} completed: ${outputPath}`);
                resolve();
            });
            writer.on('error', (err) => {
                // If aborted, we don't want to treat it as a stream error in the same way
                if (controller.signal.aborted) {
                    // Just close the writer
                    writer.end();
                    reject(new axios.Cancel('Download paused/cancelled'));
                } else {
                    reject(err);
                }
            });

            // Listen for abort signal to close stream immediately
            controller.signal.addEventListener('abort', () => {
                writer.end();
                response.data.destroy(); // Stop the incoming stream
                reject(new axios.Cancel('Download paused/cancelled'));
            });
        });

    } catch (error) {
        if (axios.isCancel(error)) {
            throw error;
        }
        console.error(`Error downloading file ${downloadId}:`, error.message);
        throw error;
    }
};

// Process download queue
const processDownloadQueue = async () => {
    const settings = readSettings();
    const maxConcurrent = settings.simultaneousDownloads || 3;

    while (downloadQueue.length > 0 && activeDownloads.size < maxConcurrent) {
        const download = downloadQueue.shift();
        activeDownloads.set(download.id, download);

        // Start download in background
        (async () => {
            try {
                download.status = 'downloading';
                download.progress = 0;

                // Extract MP4 URL with proxy
                const mp4Url = await extractMp4UrlFromSibnet(download.sibnetUrl, download.proxy);
                if (!mp4Url) {
                    throw new Error('Could not extract MP4 URL');
                }

                download.mp4Url = mp4Url;

                // Download file with proxy
                await downloadFile(
                    download.id,
                    mp4Url,
                    download.outputPath,
                    (id, progress, downloaded, total, speed) => {
                        download.progress = progress;
                        download.downloadedSize = downloaded;
                        download.totalSize = total;
                        download.speed = speed;
                    },
                    download.proxy,
                    download // Pass download object
                );

                download.status = 'completed';
                download.progress = 100;

            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log(`Download ${download.id} paused/cancelled`);
                    // Status is already set to paused or cancelled
                } else {
                    console.error(`Download ${download.id} failed:`, error);
                    download.status = 'failed';
                    download.error = error.message;
                }
            } finally {
                // Remove from active after a delay (so client can see completion)
                if (download.status === 'completed' || download.status === 'failed') {
                    setTimeout(() => {
                        activeDownloads.delete(download.id);
                        processDownloadQueue(); // Process next in queue
                    }, 5000);
                }
            }
        })();
    }
};

// Add download to queue
app.post('/api/add-download', async (req, res) => {
    const { animeTitle, season, episode, sibnetUrl, language } = req.body;

    if (!sibnetUrl || !animeTitle) {
        return res.status(400).json({ error: 'sibnetUrl and animeTitle are required' });
    }

    const settings = readSettings();
    const downloadPath = settings.downloadPath || path.join(__dirname, 'downloads');
    const folderTemplate = settings.folderTemplate || "{animeTitle}/Season {season}";
    const filenameTemplate = settings.filenameTemplate || "{animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4";

    // Prepare variables for template replacement
    const vars = {
        animeTitle: animeTitle.replace(/[<>:"/\\|?*]/g, '_'), // Sanitize title for path safety
        season: String(season),
        seasonPad: String(season).padStart(2, '0'),
        episode: String(episode),
        episodePad: String(episode).padStart(2, '0'),
        language: language || 'unknown',
        year: new Date().getFullYear().toString() // Approximation if not available
    };

    // Helper to replace templates
    const replaceTemplate = (template) => {
        let result = template;
        Object.entries(vars).forEach(([key, value]) => {
            result = result.replace(new RegExp(`{${key}}`, 'g'), value);
        });
        return result;
    };

    // Generate relative folder path and filename
    const relativeFolderPath = replaceTemplate(folderTemplate);
    const fileName = replaceTemplate(filenameTemplate);

    // Construct full paths
    // We need to handle potential subdirectories in the folder template (e.g. "Anime/Season 1")
    // and ensure we don't have double slashes or unsafe characters in the path components (except separators)

    // Split by slash to handle subdirectories, sanitize each part, then join
    const safeFolderPath = relativeFolderPath.split(/[/\\]/).map(part =>
        part.replace(/[<>:"/\\|?*]/g, '_')
    ).join(path.sep);

    const fullFolderPath = path.join(downloadPath, safeFolderPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(fullFolderPath)) {
        fs.mkdirSync(fullFolderPath, { recursive: true });
    }

    const safeFileName = fileName.replace(/[<>:"/\\|?*]/g, '_');
    const outputPath = path.join(fullFolderPath, safeFileName);

    // Assign random proxy
    const proxy = getRandomProxy();
    if (proxy) {
        console.log(`Download ${downloadIdCounter} will use proxy: ${proxy}`);
    } else {
        console.log(`Download ${downloadIdCounter} will use direct connection (no proxies configured)`);
    }

    const downloadId = downloadIdCounter++;
    const download = {
        id: downloadId,
        animeTitle,
        season,
        episode,
        language,
        sibnetUrl,
        outputPath,
        proxy,
        status: 'queued',
        progress: 0,
        addedAt: new Date().toISOString()
    };

    downloadQueue.push(download);
    console.log(`Added download ${downloadId} to queue: ${outputPath}`);

    // Start processing
    processDownloadQueue();

    res.json({ success: true, downloadId, download });
});

// Get download status
app.get('/api/downloads', (req, res) => {
    const allDownloads = [
        ...Array.from(activeDownloads.values()),
        ...downloadQueue.map(d => ({ ...d, status: 'queued' }))
    ];

    res.json(allDownloads);
});

// Get single download status
app.get('/api/download/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const download = activeDownloads.get(id);

    if (!download) {
        const queued = downloadQueue.find(d => d.id === id);
        if (queued) {
            return res.json({ ...queued, status: 'queued' });
        }
        return res.status(404).json({ error: 'Download not found' });
    }

    res.json(download);
});

// Cancel download
app.delete('/api/download/:id', (req, res) => {
    const id = parseInt(req.params.id);

    // Remove from queue
    const queueIndex = downloadQueue.findIndex(d => d.id === id);
    if (queueIndex !== -1) {
        downloadQueue.splice(queueIndex, 1);
        return res.json({ success: true, message: 'Removed from queue' });
    }

    // Cancel active download
    const download = activeDownloads.get(id);
    if (download) {
        if (download.abortController) {
            download.abortController.abort();
        }
        download.status = 'cancelled';
        activeDownloads.delete(id);

        // Delete partial file
        if (fs.existsSync(download.outputPath)) {
            try {
                fs.unlinkSync(download.outputPath);
            } catch (err) {
                console.error('Error deleting partial file:', err);
            }
        }

        return res.json({ success: true, message: 'Download cancelled' });
    }

    res.status(404).json({ error: 'Download not found' });
});

// Pause download
app.post('/api/download/:id/pause', (req, res) => {
    const id = parseInt(req.params.id);
    const download = activeDownloads.get(id);

    if (!download) {
        return res.status(404).json({ error: 'Download not found or not active' });
    }

    if (download.status !== 'downloading') {
        return res.status(400).json({ error: 'Download is not currently downloading' });
    }

    if (download.abortController) {
        download.abortController.abort();
    }
    download.status = 'paused';

    res.json({ success: true, message: 'Download paused' });
});

// Resume download (simplified, just restarts for now or resumes if range supported)
app.post('/api/download/:id/resume', async (req, res) => {
    const id = parseInt(req.params.id);
    const download = activeDownloads.get(id);

    if (!download) {
        // Check if it's in queue but marked as paused/cancelled
        const queued = downloadQueue.find(d => d.id === id);
        if (queued) {
            queued.status = 'queued';
            processDownloadQueue();
            return res.json({ success: true, message: 'Download resumed (re-queued)' });
        }
        return res.status(404).json({ error: 'Download not found' });
    }

    if (download.status === 'downloading') {
        return res.status(400).json({ error: 'Download is already in progress' });
    }

    // For now, we just re-queue it effectively
    download.status = 'queued';
    processDownloadQueue();

    res.json({ success: true, message: 'Download resumed' });
});

// GET Planning
app.get('/api/planning', async (req, res) => {
    console.log('Fetching planning...');

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled"
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36");

        await page.goto('https://anime-sama.org/planning/', {
            waitUntil: "networkidle2",
            timeout: 60000
        });

        const planningData = await page.evaluate(() => {
            const days = [];
            const dayContainers = document.querySelectorAll('.planningClass > div');

            dayContainers.forEach(container => {
                const dayName = container.querySelector('.titreJours')?.textContent?.trim();
                const date = container.querySelector('p.opacity-75')?.textContent?.trim();

                if (!dayName) return;

                const animes = [];
                const cards = container.querySelectorAll('.planning-card');

                cards.forEach(card => {
                    const title = card.getAttribute('data-title') || card.querySelector('.card-title')?.textContent?.trim();
                    const image = card.querySelector('.card-image')?.getAttribute('src');
                    const link = card.querySelector('a')?.getAttribute('href');
                    const time = card.querySelector('.info-item.episode .font-bold')?.textContent?.trim();
                    const language = card.querySelector('.language-badge-top img')?.getAttribute('title') || 'VOSTFR';

                    if (title) {
                        animes.push({
                            title,
                            image,
                            link,
                            time,
                            language
                        });
                    }
                });

                days.push({
                    day: dayName,
                    date,
                    animes
                });
            });

            return days;
        });

        await browser.close();

        // Check for local files
        const settings = readSettings();
        const downloadPath = settings.downloadPath || path.join(__dirname, 'downloads');

        // Get list of local folders
        let localFolders = [];
        if (fs.existsSync(downloadPath)) {
            localFolders = fs.readdirSync(downloadPath)
                .filter(f => fs.statSync(path.join(downloadPath, f)).isDirectory())
                .map(f => f.toLowerCase().replace(/[<>:"/\\|?*]/g, '_')); // Normalize
        }

        // Mark downloaded animes
        const enrichedPlanning = planningData.map(day => ({
            ...day,
            animes: day.animes.map(anime => {
                // Normalize anime title for comparison
                const normalizedTitle = anime.title.toLowerCase().replace(/[<>:"/\\|?*]/g, '_');
                // Check if any local folder roughly matches
                // We can do a simple includes check or exact match
                const isDownloaded = localFolders.some(folder =>
                    folder.includes(normalizedTitle) || normalizedTitle.includes(folder)
                );

                return {
                    ...anime,
                    isDownloaded
                };
            })
        }));

        res.json(enrichedPlanning);

    } catch (error) {
        console.error('Error fetching planning:', error);
        res.status(500).json({ error: 'Failed to fetch planning' });
    }
});



// Open folder
app.post('/api/open-folder', (req, res) => {
    const { path: folderPath } = req.body;

    if (!folderPath) {
        return res.status(400).json({ error: 'Path is required' });
    }

    console.log(`Opening folder: ${folderPath}`);

    try {
        // Use 'start' for Windows, 'xdg-open' for Linux, 'open' for Mac
        const command = process.platform === 'win32' ? 'start ""' :
            process.platform === 'darwin' ? 'open' : 'xdg-open';

        require('child_process').exec(`${command} "${folderPath}"`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error opening folder:', error);
        res.status(500).json({ error: 'Failed to open folder' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
