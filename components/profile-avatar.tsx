import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

export function ProfileAvatar({
  userId,
  src,
  name,
  size = "md",
  className,
}: {
  userId: string | null | undefined;
  src: string | null | undefined;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const avatar = <Avatar src={src} name={name} size={size} />;

  if (!userId) return avatar;

  return (
    <Link
      href={`/profile/${encodeURIComponent(userId)}`}
      aria-label={`View ${name}'s profile`}
      title={`View ${name}'s profile`}
      className={cn(
        "inline-flex shrink-0 rounded-full transition-transform duration-150 ease-out hover:scale-105 active:scale-95",
        className,
      )}
    >
      {avatar}
    </Link>
  );
}
