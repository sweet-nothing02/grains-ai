import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addGrain } from "./actions";
import { Input } from "@/components/ui/input";

export default async function ProfileDashboard() {
  const supabase = await createClient();

  // 1. Authenticate the user securely on the server
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch the user's grains (RLS protects this automatically)
  const { data: grains, error: grainsError } = await supabase
    .from("grains")
    .select("*")
    .order("created_at", { ascending: false });

  if (grainsError) {
    return (
      <div className="p-8 text-red-500">
        Failed to load your knowledge repository.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10 pb-4 border-b">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">My Grains</h1>
          <p className="text-muted-foreground mt-2">
            Logged in as {user.email}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <Button variant="outline" type="submit">
            Log Out
          </Button>
        </form>
      </div>
      {/* Manual Entry Mockup */}
      <div className="mb-10 p-6 bg-card border rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Save a new Link</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Paste a URL below to scrape its metadata. (This simulates the future
          Chrome Extension).
        </p>
        <form action={addGrain} className="flex gap-4">
          <Input
            name="url"
            type="url"
            placeholder="https://en.wikipedia.org/wiki/Next.js"
            required
            className="flex-1"
          />
          <Button type="submit">Capture Grain</Button>
        </form>
      </div>

      {/* Grains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grains?.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-10">
            Your digital graveyard is empty! Start saving active knowledge.
          </p>
        ) : (
          grains?.map((grain) => (
            <Card
              key={grain.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">
                  <a
                    href={grain.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    {new URL(grain.url).hostname}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {grain.summary}
                </p>

                {/* Scroll Position / Context Persistence */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Reading progress</span>
                    <span>{grain.scroll_pos}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${grain.scroll_pos}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3 text-right">
                    Saved {new Date(grain.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
