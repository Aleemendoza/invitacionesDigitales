const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value: string | undefined) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const id = host === "youtu.be" ? url.pathname.slice(1) : host.endsWith("youtube.com") ? url.searchParams.get("v") ?? (url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : null) : null;
    return id && videoIdPattern.test(id) ? id : null;
  } catch { return null; }
}

export function youtubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1`;
}
