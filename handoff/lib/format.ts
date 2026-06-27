import { formatDistanceToNowStrict, format, isToday, isTomorrow, isYesterday } from "date-fns";

export type DueTone = "overdue" | "soon" | "neutral";

export function relativeDue(iso: string, ref = new Date()): { text: string; tone: DueTone } {
  const d = new Date(iso);
  const diffMs = d.getTime() - ref.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays < 0) {
    const ago = formatDistanceToNowStrict(d, { addSuffix: false });
    return { text: `${ago} ago`, tone: "overdue" };
  }
  if (isToday(d)) return { text: "Today", tone: "soon" };
  if (isTomorrow(d)) return { text: "Tomorrow", tone: "soon" };
  if (diffDays <= 7) return { text: format(d, "EEEE"), tone: "soon" };
  return { text: format(d, "MMM d"), tone: "neutral" };
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

export function formatDateLong(iso: string) {
  return format(new Date(iso), "MMM d, yyyy · h:mm a");
}
