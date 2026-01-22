# Task Orbit

Task management application built with Next.js, Supabase, and Tailwind CSS. This project allows users to organize work using boards, lists, and cards with smooth drag-and-drop functionality.

## Features

- **Authentication**: Secure email/password login and signup via Supabase Auth.
- **Boards**: Create, edit, archive, and delete boards with custom backgrounds.
- **Lists**: Organize tasks into lists with drag-and-drop reordering.
- **Cards**: Create tasks, add descriptions and due dates, and move them between lists.
- **Drag & Drop**: Smooth, accessible drag-and-drop powered by `dnd-kit`.
- **Real-time**: Live updates for collaboration (in progress).

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Backend/DB**: Supabase (Postgres + Auth + Realtime)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Drag & Drop**: dnd-kit

## Getting Started 

1. **Clone the repository**
   ```bash
   git clone https://github.com/iiArcy/TaskOrbit.git
   cd TaskOrbit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   for the Supabase. Create a `.env` file in the root directory and paste them there:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: Never commit your `.env` file.*

4. **Workflow**
   - Create a new branch for your task: `git checkout -b feature/your-feature-name`
   - Push your branch: `git push -u origin feature/your-feature-name`
   - Open a Pull Request on GitHub for review.

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
