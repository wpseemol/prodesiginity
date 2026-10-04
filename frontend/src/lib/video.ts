import { mediaUrl } from "@/config/api";

export type VideoSource =
    | { kind: "youtube"; id: string; embedUrl: string; watchUrl: string; thumbnail: string }
    | { kind: "vimeo"; id: string; embedUrl: string; watchUrl: string }
    | { kind: "file"; url: string };

const YOUTUBE_RE =
    /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{11})(?:[?&#].*)?$/i;
const VIMEO_RE = /^https:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d{6,12})(?:[/?#].*)?$/i;
const FILE_RE = /\.(mp4|webm|mov)(?:\?.*)?$/i;

/**
 * Turns a stored video value into something safe to embed. Anything that is
 * not YouTube, Vimeo or an http(s) video file returns null and is not rendered.
 */
export function parseVideo(src: string | undefined | null): VideoSource | null {
    if (!src) return null;
    const value = src.trim();

    const yt = value.match(YOUTUBE_RE);
    if (yt) {
        const id = yt[1];
        return {
            kind: "youtube",
            id,
            embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
            watchUrl: `https://www.youtube.com/watch?v=${id}`,
            thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        };
    }

    const vimeo = value.match(VIMEO_RE);
    if (vimeo) {
        const id = vimeo[1];
        return {
            kind: "vimeo",
            id,
            embedUrl: `https://player.vimeo.com/video/${id}?dnt=1`,
            watchUrl: `https://vimeo.com/${id}`,
        };
    }

    if (!FILE_RE.test(value)) return null;
    const url = mediaUrl(value);
    if (!url || !/^https?:\/\//i.test(url)) return null;
    return { kind: "file", url };
}
