import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

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



// Initialize the Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { url, category_id, scroll_pos } = await req.json();

    let title = url;
    let description = 'No description available.';
    let imageUrl = null;
    let finalCategoryId = category_id === 'uncategorized' ? null : category_id;

    // 1. FAST SCRAPE (Only metadata, no heavy content)
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        title = $('title').text() || $('meta[property="og:title"]').attr('content') || url;
        description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || description;
        imageUrl = $('meta[property="og:image"]').attr('content') || null;
      }
    } catch (e) {
      console.warn(`[Grains] Fast scrape failed for ${url}`);
    }

    // 2. LIGHTNING AI CATEGORIZATION (Only runs if uncategorized)
    if (category_id === 'uncategorized') {
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash", 
          generationConfig: { responseMimeType: "application/json" } 
        });

        const MASTER_CATEGORIES = [
          "Technology & Software", "Artificial Intelligence", "Business & Finance", 
          "News & Current Events", "Science & Nature", "Health & Fitness", 
          "Cooking & Recipes", "Travel & Exploration", "Art & Design", 
          "Music & Audio", "Movies & Television", "Gaming", "Sports", 
          "History & Culture", "Education & Learning", "Personal Development", 
          "Productivity & Tools", "Marketing & SEO", "Cryptocurrency & Web3", 
          "Real Estate & Home", "Automotive", "Fashion & Beauty", 
          "Parenting & Family", "Humor & Entertainment", "DIY & Crafts", 
          "Photography", "Literature & Writing", "Social Media", 
          "Politics & Law", "Miscellaneous"
        ];

        // Tiny prompt = fast response
        const prompt = `
          Analyze this:
          Title: ${title}
          Desc: ${description}
          Select the BEST category from this list: ${JSON.stringify(MASTER_CATEGORIES)}.
          Respond ONLY with JSON: {"categoryName": "..."}
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = JSON.parse(result.response.text());

        if (aiResponse.categoryName) {
          const { data: existingCat } = await supabase
            .from('categories')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', aiResponse.categoryName)
            .single();

          if (existingCat) {
            finalCategoryId = existingCat.id;
          } else {
            const { data: newCat } = await supabase
              .from('categories')
              .insert({ user_id: user.id, name: aiResponse.categoryName })
              .select('id')
              .single();
            if (newCat) finalCategoryId = newCat.id;
          }
        }
      } catch (aiError) {
        console.error("[Grains] AI Categorization skipped:", aiError);
      }
    }

    // 3. INSTANT SAVE
    const { error } = await supabase.from('grains').insert({
      user_id: user.id,
      url: url,
      title: title,
      summary: description, // Temporarily save description as the summary
      scroll_pos: scroll_pos || 0,
      image_url: imageUrl,
      category_id: finalCategoryId
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