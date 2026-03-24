'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as cheerio from 'cheerio'

export async function addGrain(formData: FormData) {
  const url = formData.get('url') as string
  if (!url) return

  const supabase = await createClient()
  
  // 1. Verify user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    // 2. Fetch the target URL
    const response = await fetch(url)
    const html = await response.text()
    
    // 3. Load HTML into Cheerio to parse it
    const $ = cheerio.load(html)

    // 4. Extract Metadata (Title, Description, Image)
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || url
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || 'No description available.'
    const imageUrl = $('meta[property="og:image"]').attr('content') || null

    // 5. Save to Supabase (Defaults scroll_pos to 0)
    const { error } = await supabase.from('grains').insert({
      user_id: user.id,
      url: url,
      title: title,
      summary: description, // Using description as a temporary summary
      scroll_pos: 0, 
      image_url: imageUrl
    })

    if (error) {
      console.error("Database error:", error.message)
    }

  } catch (error) {
    console.error("Scraping failed. The website might be blocking fetch requests:", error)
  }

  // 6. Refresh the dashboard instantly to show the new Grain!
  revalidatePath('/dashboard')
}