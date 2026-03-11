export async function onRequest({ request }) {

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    })
  }

  const url = new URL(request.url)
  const target = url.searchParams.get("url")

  if (!target || !target.startsWith("http")) {
    return new Response("Invalid URL", { status: 400 })
  }

  const headers = new Headers()

  // forward range request (important for video streaming)
  const range = request.headers.get("range")
  if (range) headers.set("range", range)

  // spoof browser headers
  headers.set(
    "user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
  )

  headers.set("accept", "*/*")
  headers.set("accept-language", "en-US,en;q=0.9")

  headers.set("referer", "https://v.567440.com/")
  headers.set("origin", "https://v.567440.com")

  headers.set("sec-fetch-site", "cross-site")
  headers.set("sec-fetch-mode", "cors")
  headers.set("sec-fetch-dest", "empty")

  headers.set("sec-ch-ua", `"Chromium";v="145", "Not:A-Brand";v="99"`)
  headers.set("sec-ch-ua-mobile", "?0")
  headers.set("sec-ch-ua-platform", `"Windows"`)

  const res = await fetch(target, {
    method: request.method,
    headers,
    cf: {
      cacheTtl: 0,
      cacheEverything: false
    }
  })

  const newHeaders = new Headers(res.headers)

  // override CORS
  newHeaders.set("Access-Control-Allow-Origin", "*")
  newHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS")
  newHeaders.set("Access-Control-Allow-Headers", "*")
  newHeaders.set("Access-Control-Expose-Headers", "*")

  const contentType = res.headers.get("content-type") || ""

  // rewrite playlist if m3u8
  if (contentType.includes("mpegurl") || target.includes(".m3u8")) {

    let text = await res.text()
    const base = new URL(target)

    text = text.replace(/^(?!#)(.*)$/gm, (line) => {

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
      status: res.status,
      headers: newHeaders
    })
  }

  return new Response(res.body, {
    status: res.status,
    headers: newHeaders
  })
}



