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
    const body = await req.json();
    const { url, category_id, scroll_pos } = body;

    // 1. Scrape the metadata
    let title = url;
    let description = 'No description available.';
    let imageUrl = null;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });
      if (response.ok) {
        const html = await response.text();
        const $ = cheerio.load(html);
        title = $('title').text() || $('meta[property="og:title"]').attr('content') || url;
        description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || description;
        imageUrl = $('meta[property="og:image"]').attr('content') || null;
      }
    } catch (e) {
      console.warn(`[Grains] Scraping failed for ${url}`);
    }

    // 2. Fetch the user's categories so the AI knows what to pick from
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id);

    // 3. The AI Brain: Ask Gemini to summarize and categorize
    let finalSummary = description;
    let finalCategoryId = category_id === 'uncategorized' ? null : category_id;

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", 
        generationConfig: { responseMimeType: "application/json" } 
      });

      const prompt = `
        You are an AI assistant for a knowledge app. 
        Analyze this webpage metadata:
        Title: ${title}
        Description: ${description}

        Here is a list of the user's existing categories:
        ${JSON.stringify(categories || [])}

        Task 1: Write a concise, insightful 3-sentence summary of what this page is likely about.
        Task 2: Select the best category ID for this page from the user's list. If none fit perfectly, return null.

        Respond ONLY with a JSON object in this exact format:
        {
          "summary": "Your 3 sentence summary here.",
          "suggestedCategoryId": "uuid-or-null"
        }
      `;

      const result = await model.generateContent(prompt);
      const aiResponse = JSON.parse(result.response.text());

      finalSummary = aiResponse.summary;
      
      // If the user didn't manually pick a category in the extension, let the AI choose!
      if (category_id === 'uncategorized' && aiResponse.suggestedCategoryId) {
        finalCategoryId = aiResponse.suggestedCategoryId;
      }

    } catch (aiError) {
      console.error("[Grains] AI Generation Failed, falling back to scraped data:", aiError);
    }

    // 4. Save to Database
    const { error } = await supabase.from('grains').insert({
      user_id: user.id,
      url: url,
      title: title,
      summary: finalSummary, // Saved the AI Summary!
      scroll_pos: scroll_pos || 0,
      image_url: imageUrl,
      category_id: finalCategoryId // Saved the AI Category!
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Grains] API POST Error:", error);
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