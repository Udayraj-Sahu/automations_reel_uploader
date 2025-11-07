# 🎥 Vibcoding Reels Automation Dashboard

A **Next.js-powered automation platform** for creators and small agencies to schedule, auto-post, and track Instagram Reels — fully integrated with **Google Sheets** for management and **Instagram Graph API** for publishing.

---

## 🚀 Features

✅ **Upload & Schedule Reels**  
Upload videos (via Cloudinary) and schedule them directly from your dashboard.

✅ **AI Caption Generator**  
Automatically generate engaging, viral captions using **OpenRouter (LLaMA 3.1 / GPT)**.

✅ **Instagram Auto-Publishing**  
Auto-upload Reels to your connected Instagram Business account using the **Graph API**.

✅ **Google Sheets Sync**  
All scheduled reels are stored, updated, and tracked in **Google Sheets** for transparency and backup.

✅ **Real-Time Dashboard**  
Live stats and status updates using **SWR** and **Next.js App Router**.

✅ **Cron Automation**  
A built-in `/api/cron/run` endpoint ensures scheduled Reels are auto-published on time (works with Vercel Cron Jobs).

---

## 🧠 Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes
- **Database:** Google Sheets (via Google Service Account)
- **Integrations:**
  - Instagram Graph API (v24.0)
  - Google Cloud Service Account (Sheets API)
  - OpenRouter API (for AI captions)
- **Deployment:** Vercel

---

## 🧩 Project Structure

