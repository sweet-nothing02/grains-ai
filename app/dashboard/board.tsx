"use client";

import { updateGrainCategory } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// FIX 1: Default props to empty arrays so the app never crashes if data is null
export default function Board({
  grains = [],
  categories = [],
}: {
  grains: any[];
  categories: any[];
}) {
  const allColumns = [{ id: null, name: "Uncategorized" }, ...categories];

  const handleDragStart = (e: React.DragEvent, grainId: string) => {
    e.dataTransfer.setData("grainId", grainId);
  };

  const handleDrop = async (e: React.DragEvent, categoryId: string | null) => {
    e.preventDefault();
    const grainId = e.dataTransfer.getData("grainId");

    if (!grainId) return; // Safeguard

    // Move the grain in the database
    await updateGrainCategory(grainId, categoryId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    // FIX 2: This is strictly required for the drop event to fire
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
      urlObj.searchParams.set("g_id", grainId); // Pass the ID!
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
                <Card className="hover:border-primary/50 transition-colors overflow-hidden">
                  {/* FIX 3: Display the scraped image! */}
                  {grain.image_url && (
                    <div className="w-full h-32 bg-muted">
                      <img
                        src={grain.image_url}
                        alt={grain.title || "Cover"}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        } // Hide if image breaks
                      />
                    </div>
                  )}

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm line-clamp-2">
                      {/* We check if the URL already has parameters (?) so we safely append with & or ? */}
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
                        className="bg-primary h-full"
                        style={{ width: `${grain.scroll_pos}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Visual dropzone helper */}
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
