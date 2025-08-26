import type { ReactNode } from "react"

interface HomePageLayoutProps {
  children: ReactNode
  title: string
  description: string
  showBackButton?: boolean
  onBackClick?: () => void
}

export function HomePageLayout({ children, title, description, showBackButton = false }: HomePageLayoutProps) {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {showBackButton && (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">{description}</p>
          </div>
        )}
        {children}
      </div>
    </main>
  )
}
