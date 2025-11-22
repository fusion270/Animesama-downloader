# 🎌 Animesama Downloader

Application desktop moderne pour télécharger et gérer vos animes depuis **Anime-Sama** avec une interface élégante en mode sombre.

[![GitHub](https://img.shields.io/badge/GitHub-fusion270-blue?logo=github)](https://github.com/fusion270/Animesama-downloader)
[![License](https://img.shields.io/badge/License-Educational-green.svg)](LICENSE)

---

## 📋 Table des matières

- [🌟 Fonctionnalités](#-fonctionnalités)
- [📸 Aperçu](#-aperçu)
- [🚀 Installation](#-installation)
- [💻 Utilisation](#-utilisation)
- [⚙️ Configuration](#️-configuration)
- [🛠️ Technologies](#️-technologies)
- [📁 Structure du projet](#-structure-du-projet)
- [🤝 Contribuer](#-contribuer)
- [⚠️ Avertissement](#️-avertissement)

---

## 🌟 Fonctionnalités

### 🎬 Catalogue Animesama
- **Navigation complète** du catalogue Anime-Sama
- **Recherche en temps réel** avec filtrage instantané
- **Mise à jour du catalogue** via scraping automatisé (Puppeteer)
- **Anime vedette** avec bannière dédiée
- **Fiches détaillées** pour chaque anime avec synopsis et informations

### 📅 Planning hebdomadaire
- **Vue planning** affichant les sorties de la semaine depuis Anime-Sama
- **Filtrage intelligent** : affiche uniquement les animes déjà téléchargés
- **Design en cartes** avec images landscape pour une meilleure lisibilité
- **Informations de sortie** : jour, heure et langue
- **Navigation rapide** vers la fiche de l'anime depuis le planning

### ⬇️ Gestionnaire de téléchargements
- **File d'attente** avec gestion des priorités
- **Téléchargements simultanés** configurables (1 à 10)
- **Pause/Reprise** des téléchargements en cours
- **Barre de progression** en temps réel pour chaque téléchargement
- **Extraction automatique** des liens Sibnet depuis les pages Anime-Sama
- **Organisation automatique** des fichiers selon vos templates

### ⚙️ Paramètres personnalisables
- **Emplacement de téléchargement** avec explorateur de fichiers intégré
- **Templates de nommage** personnalisables pour dossiers et fichiers
- **Préréglages** pour serveurs média populaires (Plex, Jellyfin)
- **Aperçu en temps réel** du résultat de vos templates
- **Gestion des proxies** avec import depuis fichier texte
- **Contrôle de performance** pour optimiser la vitesse

### 📺 Navigation intuitive
- **Sidebar** avec navigation rapide entre les différentes sections
- **Interface dark mode** moderne et élégante
- **Animations fluides** avec Framer Motion
- **Responsive design** adapté à toutes les tailles d'écran

---

## 📸 Aperçu

### Interface principale
L'application se compose de 5 sections principales :
- **Animesama** : Catalogue et recherche
- **Xalaflix** : Section films et séries (en développement)
- **My List** : Vos favoris
- **Downloads** : Gestion des téléchargements
- **Settings** : Configuration de l'application

---

## 🚀 Installation

### Prérequis
- **Node.js** version 16 ou supérieure ([Télécharger](https://nodejs.org/))
- **npm** (inclus avec Node.js)
- **Git** (pour le développement)

### Installation du Backend

1. Accédez au dossier serveur :
```bash
cd server
```

2. Installez les dépendances :
```bash
npm install
```

3. Démarrez le serveur :
```bash
node index.js
```

Le backend sera accessible sur **http://localhost:3001**

### Installation du Frontend

1. À la racine du projet, installez les dépendances :
```bash
npm install
```

2. Lancez le serveur de développement :
```bash
npm run dev
```

Le frontend sera accessible sur **http://localhost:5173**

### Lancement complet

Pour utiliser l'application, vous devez avoir **les deux serveurs actifs** :
- Backend sur le port 3001
- Frontend sur le port 5173

---

## 💻 Utilisation

### 1️⃣ Mettre à jour le catalogue

- Cliquez sur **"Update List"** dans la page Animesama
- Le scraping va récupérer tous les animes disponibles sur Anime-Sama
- ⚠️ Cette opération peut prendre plusieurs minutes

### 2️⃣ Rechercher un anime

- Utilisez la **barre de recherche** pour filtrer les animes
- Cliquez sur une **carte anime** pour voir les détails

### 3️⃣ Télécharger des épisodes

1. Ouvrez la **fiche de l'anime**
2. Cliquez sur **"Download"**
3. Sélectionnez la **saison** et les **épisodes** souhaités
4. Choisissez la **langue** (VOSTFR/VF)
5. Confirmez le téléchargement

### 4️⃣ Consulter le planning

- Cliquez sur **"Planning"** dans la page Animesama
- Visualisez les animes de votre bibliothèque qui sortent cette semaine
- Cliquez sur **"Voir la fiche"** pour accéder aux détails

### 5️⃣ Gérer les téléchargements

- Accédez à la page **"Downloads"**
- Consultez l'état de vos téléchargements
- Utilisez **Pause/Resume** pour contrôler les téléchargements

---

## ⚙️ Configuration

### Templates de nommage

L'application permet de personnaliser l'organisation de vos fichiers téléchargés.

#### Variables disponibles :
- `{animeTitle}` - Titre de l'anime
- `{season}` - Numéro de saison (ex: 1)
- `{seasonPad}` - Saison avec zéro (ex: 01)
- `{episode}` - Numéro d'épisode (ex: 5)
- `{episodePad}` - Épisode avec zéro (ex: 05)
- `{language}` - Langue audio (vostfr, vf)
- `{year}` - Année de sortie

#### Exemples de templates :

**Par défaut (Recommandé)**
```
Dossier : {animeTitle}/Season {season}
Fichier : {animeTitle} - S{seasonPad}E{episodePad} [{language}].mp4
Résultat : One Piece/Season 1/One Piece - S01E05 [vostfr].mp4
```

**Plex/Jellyfin**
```
Dossier : {animeTitle} ({year})/Season {seasonPad}
Fichier : {animeTitle} - S{seasonPad}E{episodePad}.mp4
Résultat : One Piece (1999)/Season 01/One Piece - S01E05.mp4
```

**Plat (tout dans un dossier)**
```
Dossier : (vide)
Fichier : {animeTitle} - S{seasonPad}E{episodePad}.mp4
Résultat : One Piece - S01E05.mp4
```

### Proxies

Vous pouvez configurer des proxies pour les téléchargements :

1. Accédez aux **Paramètres**
2. Section **Proxies**
3. Collez vos proxies (un par ligne) :
```
http://user:pass@ip:port
socks5://ip:port
```
4. Ou importez depuis un fichier `.txt`

---

## 🛠️ Technologies

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes modernes

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Puppeteer** - Scraping et automatisation web
- **File System (fs)** - Gestion des fichiers
- **HTTP/HTTPS** - Téléchargements

---

## 📁 Structure du projet

```
animesama-downloaderV9999/
│
├── server/                 # Backend Node.js
│   ├── index.js           # Serveur Express principal
│   ├── package.json       # Dépendances backend
│   ├── downloads/         # Dossier des téléchargements (gitignored)
│   ├── db.json           # Base de données locale (gitignored)
│   ├── catalog.json      # Cache du catalogue (gitignored)
│   └── settings.json     # Configuration utilisateur (gitignored)
│
├── src/                   # Frontend React
│   ├── components/        # Composants réutilisables
│   │   ├── ui/           # Composants UI de base
│   │   ├── Layout/       # Layout et navigation
│   │   ├── AnimeDetails.tsx
│   │   ├── DownloadModal.tsx
│   │   └── FileBrowser.tsx
│   │
│   ├── pages/            # Pages de l'application
│   │   ├── Animesama.tsx    # Page catalogue
│   │   ├── Planning.tsx     # Page planning
│   │   ├── Downloads.tsx    # Page téléchargements
│   │   ├── Settings.tsx     # Page paramètres
│   │   ├── MyList.tsx       # Page favoris
│   │   └── Xalaflix.tsx     # Page films/séries
│   │
│   ├── types/            # Définitions TypeScript
│   ├── lib/              # Utilitaires
│   ├── services/         # Services (localStorage, API)
│   └── main.tsx          # Point d'entrée React
│
├── public/               # Fichiers statiques
├── .gitignore           # Exclusions Git
├── package.json         # Dépendances frontend
├── vite.config.ts       # Configuration Vite
├── tailwind.config.js   # Configuration Tailwind
└── README.md            # Ce fichier
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add: Amazing feature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

---

## ⚠️ Avertissement

**Cette application est à usage éducatif et personnel uniquement.**

- ⚖️ Respectez les **lois sur le droit d'auteur** de votre pays
- 📜 Respectez les **conditions d'utilisation** d'Anime-Sama
- 🎯 Utilisez cette application **uniquement pour du contenu légal**
- 💾 Ne **redistribuez pas** le contenu téléchargé
- 🔒 Les développeurs ne sont **pas responsables** de l'utilisation de cette application

**Note :** Cette application scrape le site Anime-Sama. Veillez à ne pas surcharger leurs serveurs avec des requêtes excessives.

---

## 📄 Licence

Ce projet est à **usage éducatif** uniquement. Aucune licence commerciale n'est accordée.

---

## 👨‍� Auteur

**fusion270**
- GitHub: [@fusion270](https://github.com/fusion270)
- Projet: [Animesama-downloader](https://github.com/fusion270/Animesama-downloader)

---

## 🙏 Remerciements

- **Anime-Sama** pour la plateforme de streaming
- **Puppeteer** pour les outils de scraping
- **La communauté open-source** pour les bibliothèques incroyables

---

<div align="center">
  
**⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile ! ⭐**

Made with ❤️ and ☕ by fusion270

</div>
