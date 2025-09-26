'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { getSearchSuggestions } from '@/app/actions';
import { useDebounce } from '@/hooks/use-debounce';

export function SmartSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedInputValue = useDebounce(inputValue, 300);

  useEffect(() => {
    if (debouncedInputValue) {
      startTransition(async () => {
        const newSuggestions = await getSearchSuggestions(debouncedInputValue);
        setSuggestions(newSuggestions);
        if (newSuggestions.length > 0) {
          setShowSuggestions(true);
        }
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedInputValue]);
  
  const handleSearch = (term: string) => {
    router.push(`/?q=${term}`);
    setShowSuggestions(false);
    setInputValue(term);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSearch(inputValue);
    }
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by SKU, size, color..."
          className="pl-9"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true)}}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showSuggestions && (
        <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50">
          <ul className="py-1">
            {isPending && <li className="px-4 py-2 text-sm text-muted-foreground">Searching...</li>}
            {!isPending && suggestions.length === 0 && debouncedInputValue && (
                <li className="px-4 py-2 text-sm text-muted-foreground">No suggestions found.</li>
            )}
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSearch(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
