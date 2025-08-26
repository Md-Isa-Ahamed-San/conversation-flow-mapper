export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            <p>© 2024 Conversation Flow Mapper. Built for Frontend Assessment.</p>
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Next.js 15</span>
            <span>TypeScript</span>
            <span>Shadcn/ui</span>
            <span>TailwindCSS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
