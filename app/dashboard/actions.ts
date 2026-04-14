'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'

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