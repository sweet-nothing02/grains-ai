# 🌾 Grains AI

**Grains AI** is a modern knowledge management tool designed to capture, organize, and track your reading progress across the web. Instead of letting your bookmarks become a "digital graveyard," Grains AI transforms them into active, organized knowledge.

---

## 🧠 The Philosophy: Knowledge, Not Just Links

The internet is overflowing with information, but saving a link isn't the same as gaining knowledge. **Grains AI** was built on three core pillars:

1.  **Context Preservation:** When you save a page, we don't just save the URL. We save exactly where you were (your scroll position). When you return, you "Jump Back In" exactly where you left off.
2.  **Automatic Organization:** Manual tagging is a chore that most people skip. Grains AI uses Gemini AI to instantly analyze and categorize every page you save into meaningful buckets.
3.  **Active Synthesis:** Reading long-form content takes time. Grains AI can generate "Deep Summaries" on demand, allowing you to review the core insights of your library in seconds.

---

## ✨ Key Features

-   **Reading Progress Tracking:** Real-time synchronization of your scroll percentage.
-   **AI Categorization:** Automatic sorting into categories like *AI, Technology, Business, Science,* and more using Gemini 2.5 Flash.
-   **Deep Summaries:** Generate comprehensive AI summaries of any saved "grain" to refresh your memory.
-   **Real-time Dashboard:** Built with Supabase Realtime, your dashboard updates instantly as you save content via the extension.
-   **"Jump Back In":** Open any saved grain from your dashboard, and it will automatically scroll you back to your last read position.

---

## 🛠️ Tech Stack

-   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
-   **Backend & Auth:** [Supabase](https://supabase.com/)
-   **AI Engine:** [Google Gemini AI](https://ai.google.dev/) (2.5 Flash)
-   **Scraping:** [Cheerio](https://cheerio.js.org/)
-   **Styling:** Tailwind CSS + [Shadcn UI](https://ui.shadcn.com/)

---

## 🔌 Installing the Chrome Extension

Since the **Grains Collector** extension is currently in development and not yet published to the Chrome Web Store, you can install it manually:

1.  Open Google Chrome and navigate to `chrome://extensions/`.
2.  In the top right corner, toggle on **Developer mode**.
3.  Click the **Load unpacked** button.
4.  In the file picker, navigate to your local `grains-ai` project folder and select the directory:
    `app/api/extension/`
5.  The **Grains Collector** icon should now appear in your extension bar.
6.  *Note: Make sure you are logged into the Grains AI web app before saving your first grain!*

---

## 🚀 Deployment

This application is designed to be deployed on **Vercel** with a **Supabase** backend. 

-   The web app handles authentication and the dashboard.
-   The Chrome extension communicates with the `/api/extension` route to save and update your progress.

---

## 📝 License

[MIT](LICENSE)
