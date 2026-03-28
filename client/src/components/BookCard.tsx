/*
  NiYAIFREE BookCard — Bookworm Bookstore Style
  Clean white card, book cover prominent, subtle shadow, hover lift
*/
import { Link } from "wouter";
import { Eye, BookOpen, Star, Heart, Bookmark } from "lucide-react";
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
    isFeatured?: boolean;
  };
  size?: "sm" | "md" | "lg";
}

export default function BookCard({ novel, size = "md" }: BookCardProps) {
  const [hovered, setHovered] = useState(false);
  const coverH = size === "lg" ? "h-72" : size === "sm" ? "h-44" : "h-56";

  return (
    <div
      className="book-card-hover group relative bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/novel/${novel.slug}`} className="no-underline block">
        {/* Cover Image */}
        <div className={`relative ${coverH} overflow-hidden`}>
          {novel.coverUrl ? (
            <img
              src={novel.coverUrl}
              alt={novel.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
              <span className="text-white text-center text-sm font-semibold leading-snug font-[Kanit]">
                {novel.title}
              </span>
            </div>
          )}

          {/* Status Badge */}
          {novel.status === "writing" && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
              กำลังเขียน
            </div>
          )}
          {novel.status === "completed" && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
              จบแล้ว
            </div>
          )}
          {novel.isFeatured && (
            <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
              <Star className="w-3 h-3 inline mr-0.5" />แนะนำ
            </div>
          )}

          {/* Age Rating */}
          {novel.ageRating && novel.ageRating !== "ทั่วไป" && (
            <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
              {novel.ageRating}
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors" title="ที่คั่น" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <Bookmark className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors" title="ถูกใจ" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <Heart className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/80 transition-colors" title="อ่านเลย">
                <BookOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold line-clamp-2 leading-snug text-slate-900 font-[Kanit] group-hover:text-primary transition-colors">
            {novel.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{novel.author}</p>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-3 h-3 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatNum(novel.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {novel.totalChapters} ตอน
            </span>
          </div>

          {/* Category */}
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 bg-primary/5 text-primary text-[10px] rounded-full font-medium">
              {novel.category}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n || 0);
}
