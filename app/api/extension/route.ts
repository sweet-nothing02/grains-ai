import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as cheerio from 'cheerio';

// GET: The extension calls this to get the user's categories
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in to the web app." }, { status: 401 });
  }

  // Fetch their categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  return NextResponse.json({ categories });
}

// POST: The extension calls this to save a new Grain
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { url, category_id, scroll_pos } = body;

    // Scrape the metadata (just like we did in the Server Action)
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text() || url;
    const description = $('meta[name="description"]').attr('content') || 'No description';
    const imageUrl = $('meta[property="og:image"]').attr('content') || null;

    // Save to database
    const { error } = await supabase.from('grains').insert({
      user_id: user.id,
      url,
      title,
      summary: description,
      scroll_pos: scroll_pos || 0,
      image_url: imageUrl,
      category_id: category_id === 'uncategorized' ? null : category_id
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save grain" }, { status: 500 });
  }
}

// PATCH: The extension calls this to silently update the scroll position
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { grain_id, scroll_pos } = await req.json();

    if (!grain_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabase
      .from('grains')
      .update({ scroll_pos })
      .eq('id', grain_id)
      .eq('user_id', user.id); // Extra security check

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}