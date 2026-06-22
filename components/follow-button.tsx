"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/lib/social-actions";

export function FollowButton({
  profileId,
  following,
}: {
  profileId: string;
  following: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant={following ? "outline" : "default"}
      disabled={pending}
      onClick={() => start(() => toggleFollow(profileId, following))}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
