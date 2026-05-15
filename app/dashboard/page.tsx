// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Board from "./board";
import { LogOut } from "lucide-react";

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Grains
              </span>
              <span className="font-light italic text-muted-foreground">AI</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Knowledge Repository
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-foreground/80">{user.email}</span>
              <span className="text-[10px] text-primary font-black uppercase tracking-tighter">Pro Member</span>
            </div>
            <form action="/login">
              <Button variant="outline" size="sm" className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-bold px-4">
                <LogOut size={16} className="mr-2" />
                Log Out
              </Button>
            </form>
          </div>
        </header>

        {/* The Drag and Drop Board */}
        <Board grains={grains || []} categories={categories || []} />
      </div>
    </div>
  );
}