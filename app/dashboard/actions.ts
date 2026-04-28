'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('categories').insert({ user_id: user.id, name });
  revalidatePath('/dashboard');
}

export async function updateGrainCategory(grainId: string, categoryId: string | null) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('grains')
    .update({ category_id: categoryId })
    .eq('id', grainId);

  if (error) {
    console.error("Failed to move grain:", error.message);
  }
  
  revalidatePath('/dashboard');
}

export async function addGrain(formData: FormData) {
  const url = formData.get('url') as string;
  const categoryId = formData.get('category_id') as string; // NEW
  if (!url) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text() || url;
    const description = $('meta[name="description"]').attr('content') || 'No description';
    const imageUrl = $('meta[property="og:image"]').attr('content') || null;

    await supabase.from('grains').insert({
      user_id: user.id,
      url,
      title,
      summary: description,
      scroll_pos: 0, 
      image_url: imageUrl,
      category_id: categoryId === 'uncategorized' ? null : categoryId // NEW
    });

  } catch (error) {
    console.error("Scraping failed:", error);
  }
  revalidatePath('/dashboard');
}

export async function deleteGrain(grainId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('grains')
    .delete()
    .eq('id', grainId);

  if (error) {
    console.error("Failed to delete grain:", error.message);
  }
  
  revalidatePath('/dashboard');
}


// Initialize Gemini for the Server Action
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateDeepSummary(grainId: string, url: string) {
  const supabase = await createClient();
  
  try {
    // 1. Heavy Scrape
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error("Could not fetch page");
    
    const html = await response.text();
    const $ = cheerio.load(html);
    let pageContent = '';
    $('p, article, h1, h2, h3').each((i, el) => {
      pageContent += $(el).text() + ' ';
    });
    pageContent = pageContent.substring(0, 5000).trim();

    // 2. Heavy AI Generation
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Write a comprehensive summary (250-300 words) of the following content. Focus on core value and key takeaways.
      CRITICAL: The summary MUST be written in the exact same language as the source text.
      Source Text: ${pageContent}
      Respond ONLY with JSON: {"summary": "..."}
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = JSON.parse(result.response.text());

    if (!aiResponse.summary) throw new Error("AI returned empty summary");

    // 3. Update Database
    const { error } = await supabase
      .from('grains')
      .update({ summary: aiResponse.summary })
      .eq('id', grainId);

    if (error) throw error;

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Deep Summary Error:", error);
    return { success: false };
  }
}