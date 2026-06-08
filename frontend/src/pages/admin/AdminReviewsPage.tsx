// src/pages/admin/AdminReviewsPage.tsx
import { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet, adminPatch, adminDelete } from "../../api/admin";

interface Review {
  id: number;
  customer: number;
  customer_name: string;
  customer_email: string;
  rating: number;
  text: string;
  is_approved: boolean;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  results: Review[];
}

const PAGE_SIZE = 20;
const STARS = [1, 2, 3, 4, 5];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {STARS.map((s) => (
        <span key={s} className={`text-xs ${s <= rating ? "text-amber-400" : "text-gray-700"}`}>★</span>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [initialised, setInitialised] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchReviews(pageNum = 1) {
    if (!token) return;
    try {
      const params = new URLSearchParams({ page: String(pageNum), page_size: String(PAGE_SIZE) });
      if (filter === "pending")  params.set("approved", "false");
      if (filter === "approved") params.set("approved", "true");

      const data = await adminGet<PaginatedResponse>(`${ADMIN}/reviews/?${params}`, token);
      setReviews(data.results ?? []);
      setCount(data.count ?? 0);
    } catch {
      console.error("Failed to load reviews");
    } finally {
      setInitialised(true);
    }
  }

  useEffect(() => {
    setPage(1);
    setInitialised(false);
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    fetchReviews(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    function startPolling() {
      pollingRef.current = setInterval(() => {
        fetchReviews(page);
      }, 5_000);
    }

    function stopPolling() {
      if (pollingRef.current !== null) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    function handleVisibility() {
      if (document.hidden) stopPolling();
      else startPolling();
    }

    if (!document.hidden) startPolling();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  async function toggleApproval(review: Review) {
    if (!token) return;
    setTogglingId(review.id);
    try {
      await adminPatch(`${ADMIN}/reviews/${review.id}/`, token, {
        is_approved: !review.is_approved,
      });
      setReviews((prev) =>
        prev.map((r) => r.id === review.id ? { ...r, is_approved: !r.is_approved } : r)
      );
    } catch {
      alert("Failed to update review.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this review permanently?")) return;
    if (!token) return;
    setDeletingId(id);
    try {
      await adminDelete(`${ADMIN}/reviews/${id}/`, token);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setCount((c) => c - 1);
    } catch {
      alert("Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f
                ? "bg-amber-500 text-gray-900"
                : "bg-gray-900 border border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-gray-500 text-xs">{count} reviews</span>
      </div>

      {/* List */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {!initialised ? null : reviews.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No reviews found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-4 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber-400 text-xs font-bold">
                    {review.customer_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">{review.customer_name || "Unknown"}</p>
                      <p className="text-gray-500 text-xs">{review.customer_email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-500 text-xs">
                        {new Date(review.created_at).toLocaleDateString("fi-FI")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        review.is_approved
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {review.is_approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <StarRating rating={review.rating} />

                  {review.text && (
                    <p className="text-gray-300 text-sm mt-1.5 leading-relaxed">{review.text}</p>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => toggleApproval(review)}
                      disabled={togglingId === review.id}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors disabled:opacity-50 ${
                        review.is_approved
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                          : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20"
                      }`}
                    >
                      {togglingId === review.id ? "…" : review.is_approved ? "Unapprove" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === review.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-xs">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-gray-900 border border-white/5 text-gray-400 text-xs rounded-lg disabled:opacity-30 hover:text-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-gray-900 border border-white/5 text-gray-400 text-xs rounded-lg disabled:opacity-30 hover:text-white transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}