import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function Dashboard() {
  const supabase = await createClient();

  // 1. Check if the user is logged in
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login"); // Send them to login if they aren't authenticated
  }

  // 2. Fetch only THIS user's grains
  const { data, error } = await supabase
    .from("grains")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">Error loading your grains.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Grains Dashboard</h1>
        <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
      </div>

      <div className="grid gap-4">
        {data?.length === 0 ? (
          <p className="text-gray-500 italic">
            No grains saved yet. Use the extension to add some!
          </p>
        ) : (
          data?.map((grain) => (
            // Inside your data.map in dashboard/page.tsx
            <Card key={grain.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-primary">
                  <a
                    href={grain.url}
                    target="_blank"
                    className="hover:underline"
                  >
                    {new URL(grain.url).hostname}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {grain.summary || "No summary generated yet."}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-mono text-gray-400">
                  <span className="bg-secondary px-2 py-1 rounded">
                    Scroll: {grain.scroll_pos}%
                  </span>
                  <span>{new Date(grain.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
