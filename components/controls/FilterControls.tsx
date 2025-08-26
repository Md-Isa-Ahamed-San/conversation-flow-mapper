"use client"

import { useState } from "react"
import type { FilterState } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllEmotions } from "@/lib/data"
import { Filter, X, User, Bot, Zap } from "lucide-react"

interface FilterControlsProps {
  filterState: FilterState
  onFilterChange: (filterState: FilterState) => void
  onReset: () => void
}

export function FilterControls({ filterState, onFilterChange, onReset }: FilterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const allEmotions = getAllEmotions()

  const handleEmotionToggle = (emotion: string) => {
    const newEmotions = filterState.emotions.includes(emotion)
      ? filterState.emotions.filter((e) => e !== emotion)
      : [...filterState.emotions, emotion]

    onFilterChange({ ...filterState, emotions: newEmotions })
  }

  const handleRoleToggle = (role: "user" | "assistant") => {
    const newRoles = filterState.roles.includes(role)
      ? filterState.roles.filter((r) => r !== role)
      : [...filterState.roles, role]

    onFilterChange({ ...filterState, roles: newRoles })
  }

  const handleConfidenceChange = (value: number[]) => {
    onFilterChange({ ...filterState, confidenceThreshold: value[0] })
  }

  const handleConnectionsToggle = () => {
    onFilterChange({ ...filterState, showConnections: !filterState.showConnections })
  }

  const activeFiltersCount =
    filterState.emotions.length + filterState.roles.length + (filterState.confidenceThreshold > 0 ? 1 : 0)

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick filters (always visible) */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterState.roles.includes("user") ? "default" : "outline"}
            size="sm"
            onClick={() => handleRoleToggle("user")}
            className="text-xs"
          >
            <User className="w-3 h-3 mr-1" />
            User Messages
          </Button>
          <Button
            variant={filterState.roles.includes("assistant") ? "default" : "outline"}
            size="sm"
            onClick={() => handleRoleToggle("assistant")}
            className="text-xs"
          >
            <Bot className="w-3 h-3 mr-1" />
            Assistant Messages
          </Button>
          <Button
            variant={filterState.showConnections ? "default" : "outline"}
            size="sm"
            onClick={handleConnectionsToggle}
            className="text-xs"
          >
            <Zap className="w-3 h-3 mr-1" />
            Show Connections
          </Button>
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Emotion filters */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Filter by Emotions</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {allEmotions.map((emotion) => (
                  <div key={emotion} className="flex items-center space-x-2">
                    <Checkbox
                      id={`emotion-${emotion}`}
                      checked={filterState.emotions.includes(emotion)}
                      onCheckedChange={() => handleEmotionToggle(emotion)}
                    />
                    <label htmlFor={`emotion-${emotion}`} className="text-sm cursor-pointer hover:text-foreground">
                      {emotion}
                    </label>
                  </div>
                ))}
              </div>

              {/* Active emotion filters */}
              {filterState.emotions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filterState.emotions.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleEmotionToggle(emotion)}
                    >
                      {emotion}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Confidence threshold */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Minimum Confidence: {filterState.confidenceThreshold}%</h4>
              <Slider
                value={[filterState.confidenceThreshold]}
                onValueChange={handleConfidenceChange}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
