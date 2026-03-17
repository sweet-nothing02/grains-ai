import { supabase } from "@/lib/supabase";

export default async function Dashboard() {
  const { data, error } = await supabase.from("grains").select("*");

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Grains Dashboard</h1>

      {data?.map((grain) => (
        <div key={grain.id} style={{ marginTop: "20px" }}>
          <p>
            <strong>URL:</strong> {grain.url}
          </p>
          <p>
            <strong>Summary:</strong> {grain.summary}
          </p>
          <p>
            <strong>Scroll Position:</strong> {grain.scroll_pos}%
          </p>
        </div>
      ))}
    </div>
  );
}
