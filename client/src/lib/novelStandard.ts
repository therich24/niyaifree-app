/**
 * NiYAIFREE Novel Quality Standard Check
 * เกณฑ์มาตรฐาน:
 * - status = "completed"
 * - totalChapters >= 10
 * - totalWords >= 10000 (หรือ avg words/chapter >= 600)
 * - มีปก (coverUrl)
 */

export interface NovelForCheck {
  status?: string;
  totalChapters?: number;
  totalWords?: number;
  coverUrl?: string;
}

export function isNovelCertified(novel: NovelForCheck): boolean {
  if (!novel) return false;
  const isCompleted = novel.status === "completed";
  const hasEnoughChapters = (novel.totalChapters || 0) >= 10;
  const hasEnoughWords = (novel.totalWords || 0) >= 10000;
  const hasCover = !!(novel.coverUrl && novel.coverUrl.trim());

  return isCompleted && hasEnoughChapters && hasEnoughWords && hasCover;
}

export function getNovelIssues(novel: NovelForCheck): string[] {
  const issues: string[] = [];
  if (novel.status !== "completed") issues.push("ยังไม่จบ");
  if ((novel.totalChapters || 0) < 10) issues.push(`ตอนน้อย (${novel.totalChapters || 0} ตอน)`);
  if ((novel.totalWords || 0) < 10000) issues.push(`คำน้อย (${(novel.totalWords || 0).toLocaleString()} คำ)`);
  if (!novel.coverUrl || !novel.coverUrl.trim()) issues.push("ไม่มีปก");
  return issues;
}
