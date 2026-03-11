export async function onRequest({ request }) {

  const url = new URL(request.url)
  const target = url.searchParams.get("url")

  if (!target) {
    return new Response("No URL", { status: 400 })
  }

  const headers = new Headers()

  const range = request.headers.get("range")
  if (range) headers.set("range", range)

  headers.set("user-agent", "Mozilla/5.0")
  headers.set("referer", "https://v.567440.com/")
  headers.set("origin", "https://v.567440.com")

  const res = await fetch(target, { headers })

  const contentType = res.headers.get("content-type") || ""

  const newHeaders = new Headers(res.headers)

  newHeaders.set("Access-Control-Allow-Origin", "*")
  newHeaders.set("Access-Control-Allow-Headers", "*")
  newHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS")

  // jika playlist m3u8
  if (contentType.includes("mpegurl")) {

    let text = await res.text()

    const base = new URL(target)

    text = text.replace(/^(?!#)(.*)$/gm, line => {

      if (!line.trim()) return line

      if (line.startsWith("http")) {
        return `/hls?url=${encodeURIComponent(line)}`
      }

      const absolute =
        base.origin +
        base.pathname.replace(/\/[^/]*$/, "/") +
        line

      return `/hls?url=${encodeURIComponent(absolute)}`
    })

    return new Response(text, {
      headers: newHeaders
    })
  }

  return new Response(res.body, {
    status: res.status,
    headers: newHeaders
  })
}
