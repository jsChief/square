import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  averageRating,
  getSellerStores,
  getStoreReviews,
  ratingDistribution,
} from "@/lib/seller/queries";
import { BarChart } from "@/components/dashboard/charts";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getPublicProfilesByIds } from "@/lib/profiles/queries";
import {
  ChartCard,
  EmptyState,
  PageHeader,
  Stars,
  formatDate,
} from "@/components/dashboard/ui";

export const metadata: Metadata = {
  title: "Your reviews — square",
  description: "What buyers are saying about your stores.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const user = await requireUser("/dashboard/reviews");
  const stores = await getSellerStores(user.id);
  const reviews = await getStoreReviews(stores.map((store) => store.id));
  const reviewerProfiles = await getPublicProfilesByIds(
    reviews.map((review) => review.user_id),
  );
  const storeName = new Map(stores.map((store) => [store.id, store.name]));

  const rating = averageRating(reviews);
  const distribution = ratingDistribution(reviews).map((point) => ({
    label: `${point.label}★`,
    value: point.value,
  }));

  return (
    <>
      <PageHeader
        title="Reviews"
        description="How buyers rate your stores."
      />

      {reviews.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={MessageSquareQuote}
            title="No reviews yet"
            message="Once buyers rate their experience with your stores, their feedback shows up here."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ChartCard title="Average rating" className="sm:col-span-1">
              <div className="flex flex-col items-start gap-2 py-2">
                <p className="text-4xl font-semibold tabular-nums">
                  {rating ? rating.toFixed(1) : "—"}
                </p>
                {rating !== null && <Stars rating={rating} />}
                <p className="text-xs text-muted">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </ChartCard>
            <ChartCard title="Breakdown" className="sm:col-span-2">
              <BarChart data={distribution} />
            </ChartCard>
          </div>

          <div className="mt-6 space-y-3">
            {reviews.map((review) => {
              const reviewer = reviewerProfiles.get(review.user_id ?? "");
              const reviewerName =
                reviewer?.username?.trim() || review.user_name?.trim() || "A buyer";
              return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <ProfileAvatar
                        userId={review.user_id}
                        src={reviewer?.avatar_url}
                        name={reviewerName}
                        size="sm"
                      />
                      <span className="truncate text-sm font-medium">
                        {reviewerName}
                      </span>
                      <span className="truncate text-xs text-muted">
                        on {storeName.get(review.store_id ?? -1) ?? "your store"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof review.rating === "number" && (
                        <Stars rating={review.rating} />
                      )}
                      <span className="text-xs text-muted">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                  {review.comment?.trim() && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {review.comment.trim()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
