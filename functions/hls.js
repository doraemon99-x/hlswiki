export async function onRequest({ request }) {
  const url = new URL(request.url)
  const target = url.searchParams.get("url")
  if (!target) return new Response("No URL", { status: 400 })

  const headers = new Headers()
  const range = request.headers.get("range")
  if (range) headers.set("range", range)

  // spoof biar lolos proteksi origin
  headers.set("user-agent", "Mozilla/5.0")
  headers.set("referer", "https://v.567440.com/")
  headers.set("origin", "https://v.567440.com")

  const res = await fetch(target, { headers })

  const newHeaders = new Headers(res.headers)

  // 🔥 override CORS
  newHeaders.set("Access-Control-Allow-Origin", "*")
  newHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS")
  newHeaders.set("Access-Control-Allow-Headers", "*")
  newHeaders.set("Access-Control-Expose-Headers", "*")

  return new Response(res.body, {
    status: res.status,
    headers: newHeaders
  })
}
