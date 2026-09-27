# Nytinol

Your path, connected. Nytinol is a personal career coach that turns a student's classes, experiences, and career goal into one graph, then recommends the next steps that move them toward that goal and shows the degree ROI of each path.

Built for [hackUMBC 2026](https://hackumbc-2026.devpost.com/) for the **Navigating the Future: Career Pathways & Degree ROI** track.

## The problem

Students can list a major, a GPA, and a job they want, and still have no clear picture of what to do next semester. Course catalogs and salary pages stay separate from the internships, research, and projects that actually shape an outcome. Nytinol puts that history and that goal on one canvas so the next class or experience is a decision, not a guess.

## What it does

- Maps classes, experiences, and a profile onto an interactive graph. Each class and experience connects to you.
- Stores a career goal on the profile: job title, industry, target salary, and how much was spent on school.
- Generates a tree of future classes and experiences from the current graph. Each suggestion shows how close it gets you to the goal, the skills it adds, and why it was recommended.
- Estimates degree ROI for experience suggestions as `(projected salary × 40 years − school spend) / school spend`.
- Keeps the graph in the browser so edits survive a refresh, and signs you in with Clerk.

## How it works

1. Sign in and open the graph. A sample computer science path is already laid out: courses such as CMSC 201 through CMSC 411, plus teaching, research, an internship, and a project.
2. Edit the profile, add or remove classes and experiences, or browse them from the sidebar file explorer.
3. Choose **Generate Suggestions**. The app sends your major, GPA, credits, classes, experiences, and goal to `POST /api/plan`.
4. The plan route forwards that payload to the planning service, which returns a tree of recommendations. Those land on the canvas as dashed suggestion nodes branching out from you.

## Stack

- [Next.js](https://nextjs.org) 16 and React 19
- [Clerk](https://clerk.com) for sign-in
- [React Flow](https://reactflow.dev) for the graph
- Tailwind CSS and shadcn/ui

## Getting started

Install dependencies and start the dev server with pnpm:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Add your Clerk keys to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Open [http://localhost:3000](http://localhost:3000), create an account, and open your graph.

**Generate Suggestions** needs the planning service that `/api/plan` forwards to. The graph, editing, and local save work without it.
