"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, User, ShoppingBag, UtensilsCrossed, Briefcase, Truck } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { searchEntities, type SearchResult } from "@/app/actions/search";

const typeConfig: Record<
  SearchResult["type"],
  { label: string; icon: typeof User; color: string }
> = {
  customer: { label: "Customers", icon: User, color: "text-blue-500" },
  order: { label: "Orders", icon: ShoppingBag, color: "text-green-500" },
  "menu-item": { label: "Menu Items", icon: UtensilsCrossed, color: "text-orange-500" },
  employee: { label: "Employees", icon: Briefcase, color: "text-purple-500" },
  supplier: { label: "Suppliers", icon: Truck, color: "text-cyan-500" },
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await searchEntities(q);
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  function handleSelect(result: SearchResult) {
    setOpen(false);
    window.location.replace(result.url);
  }

  const grouped = results.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = [];
      acc[r.type].push(r);
      return acc;
    },
    {} as Record<SearchResult["type"], SearchResult[]>
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Search across your restaurant">
      <CommandInput
        placeholder="Search customers, orders, menu items..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!query && (
          <CommandEmpty>Type to search...</CommandEmpty>
        )}
        {query.length >= 2 && !loading && results.length === 0 && (
          <CommandEmpty>No results found</CommandEmpty>
        )}
        {loading && (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}
        {Object.entries(grouped).map(([type, items]) => {
          const cfg = typeConfig[type as SearchResult["type"]];
          const Icon = cfg.icon;
          return (
            <CommandGroup key={type} heading={cfg.label}>
              {items.map((r) => (
                <CommandItem key={`${r.type}-${r.id}`} onSelect={() => handleSelect(r)}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                  <div className="flex flex-col">
                    <span>{r.title}</span>
                    {r.subtitle && (
                      <span className="text-xs text-muted-foreground">{r.subtitle}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
