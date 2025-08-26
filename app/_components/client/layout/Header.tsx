"use client"

import Link from "next/link"
import { ThemeToggle } from "@/app/_components/client/ui/ThemeToggle"

export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CF</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Conversation Flow Mapper</h1>
              <p className="text-sm text-muted-foreground">Interactive Chat Visualization</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <Link
                href="https://isa-ahamed-san-portfolio.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Built by San
              </Link>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Next.js 15 & TypeScript</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
