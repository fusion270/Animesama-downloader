import { useState, useEffect } from "react"
import { X, Folder, File, ArrowUp, FolderPlus, Check } from "lucide-react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { motion, AnimatePresence } from "framer-motion"

interface FileItem {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    modified: string;
}

interface FileBrowserProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPath: (path: string) => void;
    initialPath?: string;
}

export function FileBrowser({ isOpen, onClose, onSelectPath, initialPath }: FileBrowserProps) {
    const [currentPath, setCurrentPath] = useState(initialPath || "");
    const [parentPath, setParentPath] = useState<string | null>(null);
    const [directories, setDirectories] = useState<FileItem[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadDirectory(initialPath || "");
        }
    }, [isOpen, initialPath]);

    const loadDirectory = async (path: string) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/browse-directory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dirPath: path })
            });

            const data = await response.json();
            if (data.error) {
                console.error('Error loading directory:', data.error);
                return;
            }

            setCurrentPath(data.currentPath);
            setParentPath(data.parentPath);
            setDirectories(data.directories);
            setFiles(data.files);
        } catch (error) {
            console.error('Failed to load directory:', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToDirectory = (path: string) => {
        loadDirectory(path);
        setShowNewFolderInput(false);
        setNewFolderName("");
    };

    const createNewFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            const response = await fetch('http://localhost:3001/api/create-directory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dirPath: currentPath,
                    folderName: newFolderName
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewFolderName("");
                setShowNewFolderInput(false);
                loadDirectory(currentPath);
            }
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    };

    const handleSelect = () => {
        onSelectPath(currentPath);
        onClose();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                        <div className="bg-card w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl border border-border pointer-events-auto flex flex-col overflow-hidden">

                            {/* Header */}
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                                <div>
                                    <h2 className="text-2xl font-bold">Sélectionner un dossier</h2>
                                    <p className="text-muted-foreground text-sm">Choisissez le dossier de téléchargement</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Current Path */}
                            <div className="p-4 border-b border-border bg-background/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Chemin:</span>
                                    <code className="flex-1 text-sm font-mono bg-secondary px-3 py-1.5 rounded truncate">
                                        {currentPath || "Chargement..."}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                                    >
                                        <FolderPlus className="w-4 h-4 mr-2" />
                                        Nouveau dossier
                                    </Button>
                                </div>

                                {/* New Folder Input */}
                                {showNewFolderInput && (
                                    <div className="flex gap-2 mt-3">
                                        <Input
                                            placeholder="Nom du dossier..."
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && createNewFolder()}
                                            autoFocus
                                        />
                                        <Button onClick={createNewFolder} size="sm">
                                            Créer
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowNewFolderInput(false);
                                                setNewFolderName("");
                                            }}
                                        >
                                            Annuler
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* File List */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {loading ? (
                                    <p className="text-center text-muted-foreground py-8">Chargement...</p>
                                ) : (
                                    <div className="space-y-1">
                                        {/* Parent Directory */}
                                        {parentPath && (
                                            <button
                                                onClick={() => navigateToDirectory(parentPath)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                                            >
                                                <ArrowUp className="w-5 h-5 text-muted-foreground" />
                                                <span className="text-sm font-medium">..</span>
                                            </button>
                                        )}

                                        {/* Directories */}
                                        {directories.map((dir) => (
                                            <button
                                                key={dir.path}
                                                onClick={() => navigateToDirectory(dir.path)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left group"
                                            >
                                                <Folder className="w-5 h-5 text-primary group-hover:text-primary" />
                                                <span className="flex-1 text-sm font-medium truncate">{dir.name}</span>
                                            </button>
                                        ))}

                                        {/* Files (grayed out, not selectable) */}
                                        {files.map((file) => (
                                            <div
                                                key={file.path}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg opacity-40 cursor-not-allowed"
                                            >
                                                <File className="w-5 h-5 text-muted-foreground" />
                                                <span className="flex-1 text-sm truncate">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                                            </div>
                                        ))}

                                        {directories.length === 0 && files.length === 0 && !parentPath && (
                                            <p className="text-center text-muted-foreground py-8">Dossier vide</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border bg-background flex justify-end gap-3">
                                <Button variant="ghost" onClick={onClose}>Annuler</Button>
                                <Button onClick={handleSelect}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Sélectionner ce dossier
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
