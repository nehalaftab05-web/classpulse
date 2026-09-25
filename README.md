# 🎓 ClassPulse — Smart Google Classroom Timetable & Academic Planner

> A production-ready, full-stack academic assistant that connects with Google Classroom to automatically construct interactive weekly timetables, prioritize upcoming quizzes and assignments on a Deadline Radar, and sync schedules directly to your phone calendar (.ics / Google Calendar).

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Classroom API](https://img.shields.io/badge/Google_Classroom_API-OAuth_2.0-4285F4?style=for-the-badge&logo=google-classroom)
![Vercel](https://img.shields.io/badge/Vercel-Deployment_Ready-black?style=for-the-badge&logo=vercel)

---

## 🌟 The Problem & The Solution

- **The Problem:** University students typically enroll in 5–6 courses every semester. Google Classroom scatters assignment due dates, quiz alerts, and class schedules across isolated class streams with no unified weekly schedule. Students constantly miss deadlines and struggle with workload planning.
- **The Solution:** **ClassPulse** aggregates active coursework from Google Classroom into a unified, high-visibility dashboard featuring:
  1. **Weekly Timetable Matrix:** Color-coded class sessions, lecture rooms, and one-click Google Meet links.
  2. **Deadline Radar:** Real-time countdown tickers prioritizing tasks by urgency (`< 12h`, `< 24h`, `< 48h`).
  3. **Assignment Kanban Board:** Visual status progression (*To Do* ➔ *In Progress* ➔ *Turned In*) with celebration confetti upon completion.
  4. **Calendar Sync:** RFC 5545 compliant `.ics` calendar generation for iPhone/Android Apple Calendar, Outlook, and Google Calendar.
  5. **1-Click Recruiter Demo Mode:** Preloaded with a realistic Computer Science semester curriculum so interviewers and society leads can test the app without needing a school Google login.

---

## 🏗️ System Architecture

```
                                  [ Client Browser ]
                                          │
        ┌─────────────────────────────────┴─────────────────────────────────┐
        ▼                                                                   ▼
[ Live Google Classroom Sync ]                                     [ Recruiter Demo Mode ]
   • OAuth 2.0 Authorization Flow                                     • Pre-loaded CS courses
   • Google Classroom REST API                                        • Realistic deadlines & quizzes
   • Scopes: courses, coursework, announcements                       • Zero setup required
        └─────────────────────────────────┬─────────────────────────────────┘
                                          ▼
                             [ ClassPulse Core Engine ]
         ┌────────────────────────────────┼────────────────────────────────┐
         ▼                                ▼                                ▼
  [ Weekly Timetable ]            [ Deadline Radar ]             [ Smart Calendar Sync ]
  • Dynamic 5-day grid            • Urgency calculation          • RFC 5545 .ics generation
  • Lecture & lab slots           • Countdown tickers (<24h)     • Direct Google Calendar links
  • Meet links & room info        • Kanban task progression      • Mobile calendar import
                                          │
                                          ▼
                      [ Deployed on Vercel Serverless Platform ]
```

---

## 🚀 Quickstart: Running Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/your-username/classpulse.git
cd classpulse
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app defaults to **Demo Mode** for instantaneous testing.

---

## 🌐 Deploy to Vercel (1-Click)

ClassPulse is configured for seamless zero-config deployment on Vercel:

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ClassPulse"
   git branch -M main
   git remote add origin https://github.com/your-username/classpulse.git
   git push -u origin main
   ```
2. Go to [Vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `classpulse` repository.
4. Click **Deploy**. Vercel will automatically build and deploy the Next.js application, giving you a live `https://classpulse-*.vercel.app` URL to share on your resume and society applications!

---

## 🔑 Configuring Google Classroom OAuth (Optional for Live Mode)

To enable live Google Classroom synchronization for your university account:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **ClassPulse**.
3. Enable the **Google Classroom API** under **APIs & Services** > **Library**.
4. Configure the **OAuth Consent Screen** (User Type: *External* or *Internal* to your university domain).
5. Add the following scopes:
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me.readonly`
   - `https://www.googleapis.com/auth/classroom.announcements.readonly`
6. Go to **Credentials** > **Create Credentials** > **OAuth client ID** (Web application).
7. Add Authorized JavaScript origins: `http://localhost:3000` (and your Vercel URL).
8. Copy your Client ID into `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

---

## 🛠️ Tech Stack & Engineering Decisions

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) — Provides optimal performance, server-side rendering, and serverless API endpoints.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) — Clean, responsive dark-mode UI with accessible color contrast.
- **Icons**: [Lucide React](https://lucide.dev/) — Lightweight SVG iconography.
- **Calendar Engine**: Custom RFC 5545 `.ics` generator with standard iCalendar formatting and recurring class rules (`RRULE`).
- **User Delight**: `canvas-confetti` celebrations on completed tasks to encourage positive study habits.

---

## 📄 License

MIT License — free to use, modify, and distribute for academic and portfolio purposes.
