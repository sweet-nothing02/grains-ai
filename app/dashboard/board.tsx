"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  updateGrainCategory,
  deleteGrain,
  generateDeepSummary,
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  Sparkles,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
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

  // Prevent layout shift before localStorage loads
  if (!isLoaded)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading dashboard...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* CATEGORY ROWS */}
      <div className="flex flex-col gap-8">
        {/* THE SKELETON CATEGORY BUTTON */}
        <button
          onClick={() => {
            const name = window.prompt("Enter new category name:");
            if (name) {
              // You can wire this up to a server action to insert a new category into Supabase
              console.log("Create category:", name);
            }
          }}
          className="w-full flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl text-muted-foreground hover:text-primary transition-all group"
        >
          <div className="bg-secondary group-hover:bg-primary/10 p-2 rounded-full transition-colors">
            <Plus size={20} />
          </div>
          <span className="font-semibold">Create New Category</span>
        </button>
        {sortedCategories.map((col) => {
          const columnGrains = grains.filter(
            (g) => (g.category_id || "uncategorized") === col.id,
          );
          const isCollapsed = collapsedCategories[col.id];

          // Don't show empty categories unless they are uncategorized
          if (columnGrains.length === 0 && col.id !== "uncategorized")
            return null;

          return (
            <div
              key={col.id}
              className="flex flex-col bg-card/50 rounded-2xl border border-border/50 overflow-hidden shadow-sm"
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
            >
              {/* Row Header / Toggle */}
              <button
                onClick={() => toggleCategory(col.id)}
                className="flex items-center justify-between p-5 bg-secondary/20 hover:bg-secondary/40 transition-colors w-full text-left"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight size={20} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={20} className="text-foreground" />
                  )}
                  <h3 className="font-bold text-xl text-foreground">
                    {col.name}
                  </h3>
                  <span className="bg-background px-2.5 py-0.5 rounded-full text-muted-foreground text-xs font-semibold border border-border">
                    {columnGrains.length}
                  </span>
                </div>
              </button>

              {/* Expandable Grid Container */}
              <div
                className={`transition-all duration-300 ease-in-out ${isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
                style={{ display: "grid" }}
              >
                <div className="overflow-hidden">
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {columnGrains.map((grain) => {
                      const isGenerating = generatingIds.includes(grain.id);
                      const isAlreadySummarized =
                        grain.summary && grain.summary.length > 500;

                      return (
                        <div
                          key={grain.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, grain.id)}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-md transition-all overflow-hidden relative group bg-background">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Delete "${grain.title || "this grain"}"?\nThis action cannot be undone.`,
                                  )
                                ) {
                                  deleteGrain(grain.id);
                                }
                              }}
                              className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/95 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-border"
                              title="Delete Grain"
                            >
                              <Trash2 size={14} />
                            </button>

                            {grain.image_url && (
                              <div className="w-full h-40 bg-muted shrink-0">
                                <img
                                  src={grain.image_url}
                                  alt="Cover"
                                  className="w-full h-full object-cover"
                                  onError={(e) =>
                                    (e.currentTarget.style.display = "none")
                                  }
                                />
                              </div>
                            )}

                            <CardHeader className="p-5 pb-3">
                              <CardTitle className="text-base line-clamp-2 pr-6 leading-snug">
                                <a
                                  href={getScrollUrl(
                                    grain.url,
                                    grain.scroll_pos,
                                    grain.id,
                                  )}
                                  target="_blank"
                                  className="hover:text-primary transition-colors"
                                >
                                  {grain.title || grain.url}
                                </a>
                              </CardTitle>
                            </CardHeader>

                            <CardContent className="p-5 pt-0 flex-grow flex flex-col">
                              <div
                                onClick={() => setSelectedGrain(grain)}
                                className="group/summary cursor-pointer mb-4 flex-grow"
                                title="Click to read full summary"
                              >
                                <p className="text-sm text-muted-foreground line-clamp-3 group-hover/summary:text-foreground transition-colors leading-relaxed">
                                  {grain.summary}
                                </p>
                                <span className="text-[11px] font-semibold text-primary opacity-0 group-hover/summary:opacity-100 transition-opacity mt-1 inline-block">
                                  Expand summary ⤢
                                </span>
                              </div>

                              <div className="mt-auto">
                                {!isAlreadySummarized && (
                                  <div className="mb-4">
                                    <button
                                      disabled={isGenerating}
                                      onClick={(e) =>
                                        handleGenerateSummary(
                                          e,
                                          grain.id,
                                          grain.url,
                                        )
                                      }
                                      className={`w-full text-xs flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all font-semibold ${
                                        isGenerating
                                          ? "bg-primary/10 text-primary cursor-not-allowed border border-primary/20"
                                          : "bg-secondary/50 hover:bg-primary hover:text-primary-foreground border border-transparent shadow-sm"
                                      }`}
                                    >
                                      {isGenerating ? (
                                        <>
                                          <Loader2
                                            size={14}
                                            className="animate-spin"
                                          />{" "}
                                          Analyzing Content...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles size={14} /> AI Summary
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}

                                <div className="flex items-center gap-3">
                                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-primary h-full transition-all duration-500 ease-out"
                                      style={{ width: `${grain.scroll_pos}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-muted-foreground w-9 text-right">
                                    {grain.scroll_pos}%
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}

                    {columnGrains.length === 0 && (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-secondary/10">
                        <p className="text-sm font-medium">
                          This category is empty
                        </p>
                        <p className="text-xs mt-1">
                          Drag and drop a grain here
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

      {/* THE POPUP MODAL (Remains exactly the same) */}
      {selectedGrain && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedGrain(null)}
        >
          <div
            className="bg-card w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border border-border p-8 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGrain(null)}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>

            <h2 className="text-2xl font-bold mb-4 pr-8 leading-tight">
              {selectedGrain.title}
            </h2>

            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
              <a
                href={getScrollUrl(
                  selectedGrain.url,
                  selectedGrain.scroll_pos,
                  selectedGrain.id,
                )}
                target="_blank"
                className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-full hover:opacity-90 transition-opacity font-semibold shadow-sm"
              >
                Open Original Article ↗
              </a>
              <span className="text-sm font-semibold text-muted-foreground bg-secondary px-4 py-2 rounded-full">
                Read: {selectedGrain.scroll_pos}%
              </span>
            </div>

            <div className="prose prose-base dark:prose-invert max-w-none">
              {selectedGrain.summary
                ?.split("\n")
                .map((paragraph: string, idx: number) => (
                  <p
                    key={idx}
                    className="text-foreground/90 leading-relaxed mb-4"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedGrain(null)}
                className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-bold transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
