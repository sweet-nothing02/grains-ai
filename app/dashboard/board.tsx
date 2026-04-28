"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import {
  updateGrainCategory,
  deleteGrain,
  generateDeepSummary,
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Sparkles, X, Loader2 } from "lucide-react";

export default function Board({
  grains = [],
  categories = [],
}: {
  grains: any[];
  categories: any[];
}) {
  const router = useRouter();
  const allColumns = [{ id: null, name: "Uncategorized" }, ...categories];

  // UI State
  const [selectedGrain, setSelectedGrain] = useState<any | null>(null);
  const [generatingIds, setGeneratingIds] = useState<string[]>([]);

  useEffect(() => {
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
    await updateGrainCategory(grainId, categoryId);
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
    setGeneratingIds((prev) => [...prev, grainId]); // Start loading animation

    await generateDeepSummary(grainId, url);

    // When finished, the realtime listener will trigger router.refresh()
    // and the new long summary will automatically hide this button!
    setGeneratingIds((prev) => prev.filter((id) => id !== grainId));
  };

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full min-h-[calc(100vh-100px)]">
        {allColumns.map((col) => {
          const columnGrains = grains.filter((g) => g.category_id === col.id);

          return (
            <div
              key={col.id || "uncategorized"}
              className="min-w-[320px] max-w-[320px] bg-secondary/30 p-4 rounded-xl flex flex-col gap-4"
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
            >
              <h3 className="font-bold text-lg flex justify-between items-center">
                {col.name}{" "}
                <span className="bg-background px-2 py-1 rounded-md text-muted-foreground text-xs font-normal">
                  {columnGrains.length}
                </span>
              </h3>

              {columnGrains.map((grain) => {
                const isGenerating = generatingIds.includes(grain.id);
                // If summary is over 150 chars, it's the AI summary. Hide the button permanently.
                const isAlreadySummarized =
                  grain.summary && grain.summary.length > 150;

                return (
                  <div
                    key={grain.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, grain.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <Card className="hover:border-primary/50 transition-colors overflow-hidden relative group">
                      {/* GARBAGE BIN WITH NATIVE CONFIRMATION */}
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
                        className="absolute top-2 right-2 z-10 w-8 h-8 bg-background/90 hover:bg-destructive hover:text-destructive-foreground rounded-md flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-border"
                        title="Delete Grain"
                      >
                        <Trash2 size={16} />
                      </button>

                      {grain.image_url && (
                        <div className="w-full h-32 bg-muted">
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

                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm line-clamp-2 pr-8">
                          <a
                            href={getScrollUrl(
                              grain.url,
                              grain.scroll_pos,
                              grain.id,
                            )}
                            target="_blank"
                            className="hover:underline text-primary"
                          >
                            {grain.title || grain.url}
                          </a>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {/* CLICKABLE SUMMARY TO OPEN POPUP */}
                        <div
                          onClick={() => setSelectedGrain(grain)}
                          className="group/summary cursor-pointer mb-4"
                          title="Click to read full summary"
                        >
                          <p className="text-xs text-muted-foreground line-clamp-3 group-hover/summary:text-foreground transition-colors">
                            {grain.summary}
                          </p>
                          <span className="text-[10px] font-medium text-primary opacity-0 group-hover/summary:opacity-100 transition-opacity">
                            Read more ⤢
                          </span>
                        </div>

                        {/* THE AI BUTTON LOGIC */}
                        {!isAlreadySummarized && (
                          <div className="flex justify-start mb-4 h-8">
                            <button
                              disabled={isGenerating}
                              onClick={(e) =>
                                handleGenerateSummary(e, grain.id, grain.url)
                              }
                              className={`text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all font-medium ${
                                isGenerating
                                  ? "bg-primary/10 text-primary cursor-not-allowed border border-primary/20"
                                  : "bg-secondary hover:bg-primary text-secondary-foreground hover:text-primary-foreground border border-transparent shadow-sm"
                              }`}
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Analyzing Page...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={14} />✨ AI Summary
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* PROGRESS BAR WITH PERCENTAGE */}
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all duration-500 ease-out"
                              style={{ width: `${grain.scroll_pos}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground w-8 text-right">
                            {grain.scroll_pos}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {columnGrains.length === 0 && (
                <div className="text-xs text-center p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground">
                  Drop grain here
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- THE POPUP MODAL --- */}
      {selectedGrain && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedGrain(null)}
        >
          <div
            className="bg-card w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl border border-border p-8 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGrain(null)}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>

            <h2 className="text-2xl font-bold mb-3 pr-8 leading-tight">
              {selectedGrain.title}
            </h2>

            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border">
              <a
                href={getScrollUrl(
                  selectedGrain.url,
                  selectedGrain.scroll_pos,
                  selectedGrain.id,
                )}
                target="_blank"
                className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity font-medium"
              >
                Open Original Article ↗
              </a>
              <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                Progress: {selectedGrain.scroll_pos}%
              </span>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none text-base">
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

            <div className="mt-8 pt-6 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedGrain(null)}
                className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg text-sm font-bold transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
