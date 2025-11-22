import type { ReactNode } from "react"

interface MainLayoutProps {
    children: ReactNode;
    sidebar: ReactNode;
}

export function MainLayout({ children, sidebar }: MainLayoutProps) {
    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary">
            {sidebar}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                <div className="relative z-10 p-8 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
