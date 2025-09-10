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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RuneContent } from '@/types/mystic';
import { RuneId } from '@/content/runes-ids';
import { useRuneData } from '@/lib/runes/useRuneData';

interface CodexFiltersProps {
  runes: RuneContent[];
  onFilteredRunesChange: (filteredRunes: RuneContent[]) => void;
  collectedRunes: string[];
}

type FilterType = 'all' | 'collected' | 'favorites' | 'uncollected';
type ElementFilter = 'all' | 'fire' | 'water' | 'earth' | 'air';

export function CodexFilters({ runes, onFilteredRunesChange, collectedRunes }: CodexFiltersProps) {
  const { isFavorite } = useRuneData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [elementFilter, setElementFilter] = useState<ElementFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRunes = useMemo(() => {
    let filtered = runes;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rune => 
        rune.name.toLowerCase().includes(query) ||
        rune.upright.toLowerCase().includes(query) ||
        rune.reversed?.toLowerCase().includes(query) ||
        rune.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
        rune.altNames?.some(name => name.toLowerCase().includes(query))
      );
    }

    // Collection status filter
    if (filterType === 'collected') {
      filtered = filtered.filter(rune => collectedRunes.includes(rune.id));
    } else if (filterType === 'uncollected') {
      filtered = filtered.filter(rune => !collectedRunes.includes(rune.id));
    } else if (filterType === 'favorites') {
      filtered = filtered.filter(rune => isFavorite(rune.id as RuneId));
    }

    // Element filter
    if (elementFilter !== 'all') {
      filtered = filtered.filter(rune => rune.element === elementFilter);
    }

    return filtered;
  }, [runes, searchQuery, filterType, elementFilter, collectedRunes, isFavorite]);

  // Update parent component when filtered runes change
  useMemo(() => {
    onFilteredRunesChange(filteredRunes);
  }, [filteredRunes, onFilteredRunesChange]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setElementFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() || filterType !== 'all' || elementFilter !== 'all';

  const filterOptions = [
    { value: 'all', label: 'All Runes', count: runes.length },
    { value: 'collected', label: 'Collected', count: collectedRunes.length },
    { value: 'favorites', label: 'Favorites', count: runes.filter(r => isFavorite(r.id as RuneId)).length },
    { value: 'uncollected', label: 'Uncollected', count: runes.length - collectedRunes.length },
  ];

  const elementOptions = [
    { value: 'all', label: 'All Elements', count: runes.length },
    { value: 'fire', label: 'Fire', count: runes.filter(r => r.element === 'fire').length },
    { value: 'water', label: 'Water', count: runes.filter(r => r.element === 'water').length },
    { value: 'earth', label: 'Earth', count: runes.filter(r => r.element === 'earth').length },
    { value: 'air', label: 'Air', count: runes.filter(r => r.element === 'air').length },
  ];

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search runes by name, meaning, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {[searchQuery && 'search', filterType !== 'all' && 'type', elementFilter !== 'all' && 'element']
                  .filter(Boolean).length}
              </Badge>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Collection Status Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Collection Status</h4>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filterType === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(option.value as FilterType)}
                    className={cn(
                      'h-8 text-xs',
                      filterType === option.value 
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {option.label}
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {option.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Element Filter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Element</h4>
              <div className="flex flex-wrap gap-2">
                {elementOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={elementFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setElementFilter(option.value as ElementFilter)}
                    className={cn(
                      'h-8 text-xs',
                      elementFilter === option.value 
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {option.label}
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {option.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredRunes.length} of {runes.length} runes
        </div>
      </CardContent>
    </Card>
  );
}
