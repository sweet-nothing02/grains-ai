"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser"; // Make sure we use the browser client here!
import { updateGrainCategory } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteGrain } from "./actions"; // Import deleteGrain!

export default function Board({
  grains = [],
  categories = [],
}: {
  grains: any[];
  categories: any[];
}) {
  const router = useRouter();
  const allColumns = [{ id: null, name: "Uncategorized" }, ...categories];

  // --- NEW: REALTIME WEBSOCKET SUBSCRIPTION ---
  useEffect(() => {
    const supabase = createClient();

    // Create a channel to listen to the 'grains' table
    const channel = supabase
      .channel("realtime-grains")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for INSERT, UPDATE, and DELETE
          schema: "public",
          table: "grains",
        },
        (payload) => {
          console.log("[Grains] Realtime update received!", payload);
          // router.refresh() quietly updates the Server Components in the background
          // without losing your client-side state or forcing a hard reload.
          router.refresh();
        },
      )
      .subscribe();

    // Cleanup the subscription when you leave the dashboard
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);
  // ---------------------------------------------

  const handleDragStart = (e: React.DragEvent, grainId: string) => {
    e.dataTransfer.setData("grainId", grainId);
  };

  const handleDrop = async (e: React.DragEvent, categoryId: string | null) => {
    e.preventDefault();
    const grainId = e.dataTransfer.getData("grainId");
    if (!grainId) return;
    await updateGrainCategory(grainId, categoryId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Helper to safely inject query parameters
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

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {allColumns.map((col) => {
        const columnGrains = grains.filter((g) => g.category_id === col.id);

        return (
          <div
            key={col.id || "uncategorized"}
            className="min-w-[300px] bg-secondary/30 p-4 rounded-xl flex flex-col gap-4"
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <h3 className="font-bold text-lg">
              {col.name}{" "}
              <span className="text-muted-foreground text-sm font-normal">
                ({columnGrains.length})
              </span>
            </h3>

            {columnGrains.map((grain) => (
              <div
                key={grain.id}
                draggable
                onDragStart={(e) => handleDragStart(e, grain.id)}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Notice the 'group' class added here to track hover state */}
                <Card className="hover:border-primary/50 transition-colors overflow-hidden relative group">
                  {/* --- NEW: The Delete Button --- */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents dragging when clicking delete
                      deleteGrain(grain.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-background/80 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    title="Delete Grain"
                  >
                    ✕
                  </button>
                  {/* ----------------------------- */}

                  {grain.image_url && (
                    <div className="w-full h-32 bg-muted">
                      <img
                        src={grain.image_url}
                        alt={grain.title || "Cover"}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm line-clamp-2 pr-4">
                      {" "}
                      {/* Added pr-4 so text doesn't overlap the X */}
                      <a
                        href={getScrollUrl(
                          grain.url,
                          grain.scroll_pos,
                          grain.id,
                        )}
                        target="_blank"
                        className="hover:underline"
                      >
                        {grain.title || grain.url}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {grain.summary}
                    </p>
                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500 ease-out"
                        style={{ width: `${grain.scroll_pos}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {columnGrains.length === 0 && (
              <div className="text-xs text-center p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground">
                Drop grain here
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
