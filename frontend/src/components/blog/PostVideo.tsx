/**
 * components/blog/PostVideo.tsx
 * ---------------------------------------------------------------------------
 * Featured video and in-article video blocks. YouTube uses the
 * privacy-enhanced (no-cookie) domain; Vimeo gets `dnt=1`. Unknown hosts are
 * not rendered at all — see lib/video.ts.
 */

import { parseVideo } from "@/lib/video";

interface PostVideoProps {
    src: string;
    title: string;
    caption?: string;
    poster?: string;
    className?: string;
}

export default function PostVideo({ src, title, caption, poster, className }: PostVideoProps) {
    const video = parseVideo(src);
    if (!video) return null;

    return (
        <figure className={className}>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border-color bg-slate-900 shadow-lg dark:border-dark-border-color">
                {video.kind === "file" ? (
                    <video
                        src={video.url}
                        poster={poster}
                        controls
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover"
                        aria-label={title}
                    >
                        <a href={video.url}>Download the video</a>
                    </video>
                ) : (
                    <iframe
                        src={video.embedUrl}
                        title={title}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                        className="absolute inset-0 h-full w-full"
                    />
                )}
            </div>
            {caption && (
                <figcaption className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}
