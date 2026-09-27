const PLAN_API_URL = "https://nr0cfvl5-8000.use.devtunnels.ms/plan"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = await request.text()
  const upstream = await fetch(PLAN_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  })

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    },
  })
}
