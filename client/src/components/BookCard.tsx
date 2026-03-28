/**
 * Design: Koparion Reborn — Book card with hover lift effect and orange ribbon
 * Covers: If no cover, show black placeholder with title
 * Click cover to expand (lightbox)
 */
import { Link } from "wouter";
import { Eye, Heart, BookOpen } from "lucide-react";
import { useState } from "react";

interface BookCardProps {
  novel: {
    id: number;
    title: string;
    slug: string;
    author: string;
    category: string;
    coverUrl: string;
    totalChapters: number;
    viewCount: number;
    likeCount: number;
    ageRating?: string;
    status?: string;
  };
  size?: "sm" | "md" | "lg";
}

export default function BookCard({ novel, size = "md" }: BookCardProps) {
  const [lightbox, setLightbox] = useState(false);
  const coverH = size === "lg" ? "h-72" : size === "sm" ? "h-44" : "h-56";

  return (
    <>
      <div className="book-card group relative">
        <Link href={`/novel/${novel.slug}`} className="no-underline block">
          {/* Cover */}
          <div className={`relative ${coverH} rounded-lg overflow-hidden shadow-md`}>
            {novel.coverUrl ? (
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightbox(true); }}
              />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center p-3">
                <span className="text-white text-center text-sm font-medium leading-snug" style={{ fontFamily: "Kanit" }}>
                  {novel.title}
                </span>
              </div>
            )}

            {/* Status ribbon */}
            {novel.status === "writing" && (
              <div className="absolute top-2 left-0 px-2 py-0.5 text-[10px] font-bold text-white rounded-r-md" style={{ background: "oklch(0.72 0.16 60)" }}>
                กำลังเขียน
              </div>
            )}

            {/* Age rating badge */}
            {novel.ageRating && novel.ageRating !== "ทั่วไป" && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded">
                {novel.ageRating}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" style={{ color: "oklch(0.40 0.12 155)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-2.5 px-0.5">
            <h3 className="text-sm font-semibold line-clamp-2 leading-snug text-foreground" style={{ fontFamily: "Kanit" }}>
              {novel.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{novel.author}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="genre-pill !px-2 !py-0.5 !text-[10px]">{novel.category}</span>
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {formatNum(novel.viewCount)}</span>
              <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" /> {novel.totalChapters} ตอน</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Lightbox */}
      {lightbox && novel.coverUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <img src={novel.coverUrl} alt={novel.title} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
        </div>
      )}
    </>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n || 0);
}
