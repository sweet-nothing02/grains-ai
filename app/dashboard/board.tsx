"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  updateGrainCategory,
  deleteGrain,
  generateDeepSummary,
  createCategory,
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Sparkles,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  FoldVertical,
  UnfoldVertical,
  ExternalLink,
  AlertCircle
} from "lucide-react";

export default function Board({
  grains = [],
  categories = [],
}: {
  grains: any[];
  categories: any[];
}) {
  const router = useRouter();

  // UI State
  const [selectedGrain, setSelectedGrain] = useState<any | null>(null);
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Load collapsed state from LocalStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("grains_collapsed_state");
    if (savedState) setCollapsedCategories(JSON.parse(savedState));
    setIsLoaded(true);

    const supabase = createClient();
    const channel = supabase
      .channel("realtime-grains")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "grains" },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  // 2. Save collapsed state to LocalStorage when changed
  const toggleCategory = (categoryId: string) => {
    const newState = {
      ...collapsedCategories,
      [categoryId]: !collapsedCategories[categoryId],
    };
    setCollapsedCategories(newState);
    localStorage.setItem("grains_collapsed_state", JSON.stringify(newState));
  };

  const toggleAllCategories = (collapse: boolean) => {
    const newState: Record<string, boolean> = {};
    const allIds = ["uncategorized", ...categories.map((c) => c.id)];
    allIds.forEach((id) => {
      newState[id] = collapse;
    });
    setCollapsedCategories(newState);
    localStorage.setItem("grains_collapsed_state", JSON.stringify(newState));
  };

  // 3. Sort Categories by the latest Grain added to them
  const sortedCategories = useMemo(() => {
    const allColumns = [
      { id: "uncategorized", name: "Uncategorized" },
      ...categories,
    ];

    return allColumns.sort((a, b) => {
      const aGrains = grains.filter(
        (g) => (g.category_id || "uncategorized") === a.id,
      );
      const bGrains = grains.filter(
        (g) => (g.category_id || "uncategorized") === b.id,
      );

      // Get the most recent created_at timestamp for each category
      const aLatest =
        aGrains.length > 0
          ? Math.max(
              ...aGrains.map((g) => new Date(g.created_at || 0).getTime()),
            )
          : 0;
      const bLatest =
        bGrains.length > 0
          ? Math.max(
              ...bGrains.map((g) => new Date(g.created_at || 0).getTime()),
            )
          : 0;

      return bLatest - aLatest; // Descending order (newest first)
    });
  }, [grains, categories]);

  const filteredGrains = useMemo(() => {
    if (!searchQuery.trim()) return grains;
    const query = searchQuery.toLowerCase();
    return grains.filter(
      (g) =>
        g.title?.toLowerCase().includes(query) ||
        g.summary?.toLowerCase().includes(query) ||
        g.url?.toLowerCase().includes(query),
    );
  }, [grains, searchQuery]);

  const isAllCollapsed = useMemo(() => {
    const allIds = ["uncategorized", ...categories.map((c) => c.id)];
    return allIds.every((id) => collapsedCategories[id]);
  }, [collapsedCategories, categories]);

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, grainId: string) => {
    e.dataTransfer.setData("grainId", grainId);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = async (e: React.DragEvent, categoryId: string | null) => {
    e.preventDefault();
    const grainId = e.dataTransfer.getData("grainId");
    if (!grainId) return;
    await updateGrainCategory(
      grainId,
      categoryId === "uncategorized" ? null : categoryId,
    );
  };

  const getScrollUrl = (
    originalUrl: string,
    scrollPos: number,
    grainId: string,
  ) => {
    try {
      const urlObj = new URL(originalUrl);
      urlObj.searchParams.set("g_scroll", scrollPos.toString());
      urlObj.searchParams.set("g_id", grainId);
      return urlObj.toString();
    } catch (e) {
      return originalUrl;
    }
  };

  const handleGenerateSummary = async (
    e: React.MouseEvent,
    grainId: string,
    url: string,
  ) => {
    e.stopPropagation();
    setGeneratingIds((prev) => [...prev, grainId]);
    await generateDeepSummary(grainId, url);
    setGeneratingIds((prev) => prev.filter((id) => id !== grainId));
  };

  const GrainCard = ({ grain }: { grain: any }) => {
    const isGenerating = generatingIds.includes(grain.id);
    const isAlreadySummarized = grain.summary && grain.summary.length > 500;
    const isConfirmingDelete = deletingId === grain.id;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, grain.id)}
        className="cursor-grab active:cursor-grabbing h-full"
      >
        <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group bg-background/50 backdrop-blur-sm border-border/50">
          
          {/* Inline Delete Confirmation */}
          <div
            className={`absolute inset-0 z-20 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${isConfirmingDelete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          >
            <AlertCircle className="text-destructive mb-3" size={32} />
            <h4 className="font-bold text-sm mb-1">Delete this grain?</h4>
            <p className="text-[10px] text-muted-foreground mb-4">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-2 w-full">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 h-8 text-[10px] font-bold"
                onClick={() => deleteGrain(grain.id)}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-[10px] font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingId(grain.id);
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/95 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md border border-border"
            title="Delete Grain"
          >
            <Trash2 size={14} />
          </button>

          {grain.image_url && (
            <div className="w-full h-44 bg-muted shrink-0 overflow-hidden">
              <img
                src={grain.image_url}
                alt="Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}

          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base line-clamp-2 pr-6 leading-tight font-bold group-hover:text-primary transition-colors">
              <a
                href={getScrollUrl(grain.url, grain.scroll_pos, grain.id)}
                target="_blank"
                className="flex items-center gap-2"
              >
                {grain.title || grain.url}
                <ExternalLink size={12} className="shrink-0 opacity-50" />
              </a>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 pt-0 flex-grow flex flex-col">
            <div
              onClick={() => setSelectedGrain(grain)}
              className="group/summary cursor-pointer mb-6 flex-grow"
              title="Click to read full summary"
            >
              <p className="text-sm text-muted-foreground line-clamp-3 group-hover/summary:text-foreground transition-colors leading-relaxed">
                {grain.summary}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-primary opacity-0 group-hover/summary:opacity-100 transition-all transform translate-y-1 group-hover/summary:translate-y-0">
                <span>View Full Summary</span>
                <Sparkles size={10} />
              </div>
            </div>

            <div className="mt-auto space-y-4">
              {!isAlreadySummarized && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isGenerating}
                  onClick={(e) =>
                    handleGenerateSummary(e, grain.id, grain.url)
                  }
                  className={`w-full text-xs h-9 font-bold transition-all ${
                    isGenerating
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />{" "}
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-2" /> Deep Summary
                    </>
                  )}
                </Button>
              )}

              <div className="flex items-center gap-3">
                <div className="w-full bg-secondary/50 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                    style={{ width: `${grain.scroll_pos}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-muted-foreground w-9 text-right uppercase tracking-tighter">
                  {grain.scroll_pos}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Prevent layout shift before localStorage loads
  if (!isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse font-medium">
        Syncing your knowledge board...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6">
      {/* TOOLBAR */}
      <div className="sticky top-4 z-40 mb-10 p-2 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search grains by title, content or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 h-11 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              const name = window.prompt("Enter new category name:");
              if (name) {
                // You can wire this up to a server action
                const form = new FormData();
                form.append("name", name);
                createCategory(form);
              }
            }}
            className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Category</span>
          </Button>
        </div>
      </div>

      {!searchQuery && (
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground font-medium"
            onClick={() => toggleAllCategories(!isAllCollapsed)}
          >
            {isAllCollapsed ? (
              <>
                <UnfoldVertical size={16} className="mr-2" /> Expand All Categories
              </>
            ) : (
              <>
                <FoldVertical size={16} className="mr-2" /> Collapse All Categories
              </>
            )}
          </Button>
        </div>
      )}

      {searchQuery ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Search className="text-primary" />
              Search Results
              <span className="text-sm font-normal text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {filteredGrains.length} found
              </span>
            </h2>
          </div>

          {filteredGrains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGrains.map((grain) => (
                <GrainCard key={grain.id} grain={grain} />
              ))}
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-secondary/10 rounded-3xl border-2 border-dashed border-border/50">
              <div className="p-6 bg-background rounded-full shadow-inner">
                <Search size={48} className="text-muted-foreground/20" />
              </div>
              <div>
                <p className="text-lg font-bold">No grains match your search</p>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Try using different keywords or check for typos.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {sortedCategories.map((col) => {
            const columnGrains = grains.filter(
              (g) => (g.category_id || "uncategorized") === col.id,
            );
            const isCollapsed = collapsedCategories[col.id];

            if (columnGrains.length === 0 && col.id !== "uncategorized")
              return null;

            return (
              <div
                key={col.id}
                className="flex flex-col group/cat"
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
              >
                {/* Row Header / Toggle */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <button
                    onClick={() => toggleCategory(col.id)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                  >
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${isCollapsed ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"}`}
                    >
                      {isCollapsed ? (
                        <ChevronRight size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                    <h3 className="font-black text-2xl tracking-tight text-foreground/90 uppercase">
                      {col.name}
                    </h3>
                    <span className="bg-foreground/5 text-muted-foreground px-3 py-0.5 rounded-full text-xs font-black border border-border/50">
                      {columnGrains.length}
                    </span>
                  </button>

                  <div className="h-px flex-1 mx-6 bg-border/40 hidden md:block" />

                  <div className="flex items-center gap-2 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Drop here to move
                    </span>
                  </div>
                </div>

                {/* Expandable Grid Container */}
                <div
                  className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "grid-rows-[0fr] opacity-0 pointer-events-none" : "grid-rows-[1fr] opacity-100"}`}
                  style={{ display: "grid" }}
                >
                  <div className="overflow-hidden">
                    <div className="p-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {columnGrains.map((grain) => (
                        <GrainCard key={grain.id} grain={grain} />
                      ))}

                      {columnGrains.length === 0 && (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl bg-secondary/5 hover:bg-secondary/10 transition-colors">
                          <Plus size={32} className="mb-4 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">
                            Category Empty
                          </p>
                          <p className="text-xs mt-1 text-muted-foreground/60">
                            Drag a grain here to categorize it
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* THE POPUP MODAL (Enhanced styling) */}
      {selectedGrain && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedGrain(null)}
        >
          <div
            className="bg-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-border/50 relative animate-in zoom-in-95 slide-in-from-bottom-8 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={() => setSelectedGrain(null)}
                className="p-2.5 bg-background/80 hover:bg-secondary rounded-full transition-all border border-border/50 shadow-sm"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12">
              <header className="mb-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    AI Analysis
                  </div>
                  <div className="bg-secondary text-muted-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-border/50">
                    Read: {selectedGrain.scroll_pos}%
                  </div>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-foreground pr-12">
                  {selectedGrain.title}
                </h2>

                <div className="flex items-center gap-4">
                  <a
                    href={getScrollUrl(
                      selectedGrain.url,
                      selectedGrain.scroll_pos,
                      selectedGrain.id,
                    )}
                    target="_blank"
                    className="group inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all font-black text-sm shadow-xl shadow-foreground/10"
                  >
                    Explore Original
                    <ExternalLink
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                </div>
              </header>

              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-foreground/80">
                {selectedGrain.summary
                  ?.split("\n")
                  .map((paragraph: string, idx: number) => (
                    <p key={idx} className="mb-6 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>

            <div className="p-8 bg-secondary/30 border-t border-border/50 flex justify-between items-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Last updated:{" "}
                {new Date(selectedGrain.created_at).toLocaleDateString()}
              </p>
              <Button
                onClick={() => setSelectedGrain(null)}
                variant="outline"
                className="px-8 py-6 rounded-2xl font-black text-sm uppercase tracking-widest border-border/50 hover:bg-background transition-all"
              >
                Close Summary
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}