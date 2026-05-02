// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addGrain, createCategory } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Board from "./board";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // Fetch Grains AND Categories in parallel
  const [{ data: grains }, { data: categories }] = await Promise.all([
    supabase
      .from("grains")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">GrainsAI</h1>
        <form action="/login">
          <Button variant="outline">Log Out</Button>
        </form>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 border rounded-xl bg-card">
          <h2 className="font-semibold mb-4">1. Create a Category</h2>
          <form action={createCategory} className="flex gap-4">
            <Input name="name" placeholder="e.g., Next.js Tutorials" required />
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
        </div>

        <div className="p-6 border rounded-xl bg-card">
          <h2 className="font-semibold mb-4">2. Save a Link</h2>
          <form action={addGrain} className="flex gap-2">
            <Input
              name="url"
              type="url"
              placeholder="https://..."
              required
              className="flex-1"
            />
            <select
              name="category_id"
              className="border rounded-md px-3 text-sm bg-background"
            >
              <option value="uncategorized">Uncategorized</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Button type="submit">Save</Button>
          </form>
        </div>
      </div> */}

      {/* The Drag and Drop Board */}
      <Board grains={grains || []} categories={categories || []} />
    </div>
  );
}
