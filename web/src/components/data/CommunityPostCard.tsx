import type { Prisma } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { SocialEmbed } from "./SocialEmbed";
import { SOCIAL_CATEGORY_LABEL, SOCIAL_PLATFORM_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/format";

type PostWithMunicipio = Prisma.SocialPostGetPayload<{
  include: { municipio: { select: { name: true; divipolaCode: true } } };
}>;

export function CommunityPostCard({ post }: { post: PostWithMunicipio }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {SOCIAL_PLATFORM_LABEL[post.platform] ?? post.platform}
          {post.authorHandle && <span className="text-zinc-400 dark:text-zinc-600"> · {post.authorHandle}</span>}
        </span>
        <Badge variant="neutral">{SOCIAL_CATEGORY_LABEL[post.category] ?? post.category}</Badge>
      </div>

      {post.municipio && (
        <Link
          href={`/ciudad/${post.municipio.divipolaCode}`}
          className="mt-1 inline-block text-xs font-medium uppercase tracking-wide text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
        >
          {post.municipio.name}
        </Link>
      )}

      <div className="mt-3">
        <SocialEmbed platform={post.platform} permalink={post.permalink} />
      </div>

      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
        Capturado {formatDate(post.capturedAt)}
      </p>
    </Card>
  );
}
