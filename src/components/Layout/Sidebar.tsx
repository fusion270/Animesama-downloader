import { Film, Download, Settings, Tv, Bookmark } from "lucide-react"
import { cn } from "../../lib/utils"
import logo from "../../assets/image.jpg"

type Page = 'animesama' | 'xalaflix' | 'downloads' | 'settings' | 'mylist';

interface SidebarProps {
    currentPage: Page;
    onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
    const navItems = [
        { id: 'animesama', label: 'Animesama', icon: Tv },
        { id: 'xalaflix', label: 'Xalaflix', icon: Film },
        { id: 'mylist', label: 'My List', icon: Bookmark },
        { id: 'downloads', label: 'Downloads', icon: Download },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
            <div className="p-6 flex items-center gap-3 border-b border-border/50">
                <img src={logo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
                <h1 className="font-bold text-lg tracking-tight">Scrap Nigga 2.0</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            currentPage === item.id
                                ? "bg-primary/10 text-primary hover:bg-primary/15"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", currentPage === item.id ? "text-primary" : "text-muted-foreground")} />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border/50">
                <div className="bg-accent/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-muted-foreground">System Online</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80">v1.0.0-beta</p>
                </div>
            </div>
        </div>
    )
}
