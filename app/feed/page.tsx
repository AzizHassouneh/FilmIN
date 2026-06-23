import { redirect } from "next/navigation";

// The personalized feed now lives on Home (/). This route is kept only so old
// links and bookmarks don't 404.
export default function FeedPage() {
  redirect("/");
}
