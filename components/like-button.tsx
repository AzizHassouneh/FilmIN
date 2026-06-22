"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLike } from "@/lib/social-actions";

export function LikeButton({
  postId,
  liked,
  count,
}: {
  postId: string;
  liked: boolean;
  count: number;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => toggleLike(postId, liked))}
      aria-pressed={liked}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
    >
      <Heart className={`size-4 ${liked ? "fill-primary text-primary" : ""}`} />
      <span>{count}</span>
    </button>
  );
}
