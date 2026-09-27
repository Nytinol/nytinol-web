import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

export default async function Home() {
  const { userId } = await auth()

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
          N
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">Your path, connected.</h1>
          <p className="text-muted-foreground">
            Sign in to explore your experiences, classes, and goals in one graph.
          </p>
        </div>
        {!userId ? (
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
                Create account
              </button>
            </SignUpButton>
          </div>
        ) : (
          <Link
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            href="/graph"
          >
            Open your graph
          </Link>
        )}
      </div>
    </main>
  )
}