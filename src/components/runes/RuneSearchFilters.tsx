'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  StarOff,
  Zap,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RuneContent } from '@/types/mystic';
import { RuneId } from '@/content/runes-ids';

interface RuneSearchFiltersProps {
  runes: RuneContent[];
  favorites: Set<RuneId>;
  onFilterChange: (filteredRunes: RuneContent[]) => void;
  onRuneClick: (runeId: RuneId) => void;
  onToggleFavorite: (runeId: RuneId) => void;
}

type FilterType = 'all' | 'favorites' | 'element';
type ElementFilter = 'fire' | 'water' | 'earth' | 'air';

export function RuneSearchFilters({
  runes,
  favorites,
  onFilterChange,
  onRuneClick,
  onToggleFavorite
}: RuneSearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [elementFilter, setElementFilter] = useState<ElementFilter | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique elements from runes
  const availableElements = useMemo(() => {
    const elements = new Set<ElementFilter>();
    runes.forEach(rune => {
      if (rune.element) {
        elements.add(rune.element);
      }
    });
    return Array.from(elements).sort();
  }, [runes]);

  // Filter runes based on search and filters
  const filteredRunes = useMemo(() => {
    let filtered = runes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rune => 
        rune.name.toLowerCase().includes(query) ||
        rune.upright.toLowerCase().includes(query) ||
        rune.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
        rune.altNames?.some(name => name.toLowerCase().includes(query))
      );
    }

    // Favorites filter
    if (activeFilter === 'favorites') {
      filtered = filtered.filter(rune => favorites.has(rune.id as RuneId));
    }

    // Element filter
    if (elementFilter) {
      filtered = filtered.filter(rune => rune.element === elementFilter);
    }

    return filtered;
  }, [runes, searchQuery, activeFilter, elementFilter, favorites]);

  // Update parent when filters change
  useMemo(() => {
    onFilterChange(filteredRunes);
  }, [filteredRunes, onFilterChange]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveFilter('all');
    setElementFilter(null);
  };

  const hasActiveFilters = searchQuery.trim() || activeFilter !== 'all' || elementFilter;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search runes by name, meaning, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {[searchQuery && 'search', activeFilter !== 'all' && 'type', elementFilter && 'element']
                .filter(Boolean).length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <Card className="border-border">
          <CardContent className="p-4 space-y-4">
            {/* Filter Type */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Filter by</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className={cn(
                    activeFilter === 'all' && 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  )}
                >
                  All Runes
                </Button>
                <Button
                  variant={activeFilter === 'favorites' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('favorites')}
                  className={cn(
                    activeFilter === 'favorites' && 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  )}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Favorites ({favorites.size})
                </Button>
              </div>
            </div>

            {/* Element Filter */}
            {availableElements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Element
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!elementFilter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setElementFilter(null)}
                    className={cn(
                      !elementFilter && 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    )}
                  >
                    All Elements
                  </Button>
                  {availableElements.map(element => (
                    <Button
                      key={element}
                      variant={elementFilter === element ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setElementFilter(element)}
                      className={cn(
                        elementFilter === element && 'bg-yellow-500 hover:bg-yellow-600 text-black',
                        'capitalize'
                      )}
                    >
                      {element}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredRunes.length} of {runes.length} runes
        {hasActiveFilters && (
          <span className="text-yellow-400 ml-1">(filtered)</span>
        )}
      </div>
    </div>
  );
}
