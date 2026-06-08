// src/pages/admin/AdminMessagesPage.tsx
import { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "../../hooks/useAuth";
import { ADMIN, adminGet, adminPatch, adminDelete } from "../../api/admin";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  results: Message[];
}

const PAGE_SIZE = 20;

export default function AdminMessagesPage() {
  const { token } = useAdminAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("unread");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [initialised, setInitialised] = useState(false); // ← replaces loading
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchMessages(pageNum = 1) {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        page_size: String(PAGE_SIZE),
      });
      if (filter === "unread") params.set("is_read", "false");
      if (filter === "read") params.set("is_read", "true");

      const data = await adminGet<PaginatedResponse>(
        `${ADMIN}/messages/?${params.toString()}`,
        token,
      );
      setMessages(data.results ?? []);
      setCount(data.count ?? 0);
    } catch {
      console.error("Failed to load messages");
    } finally {
      setInitialised(true);
    }
  }

  useEffect(() => {
    setPage(1);
    setInitialised(false); // reset on filter change so empty state doesn't flash
    fetchMessages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    fetchMessages(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    function startPolling() {
      pollingRef.current = setInterval(() => {
        fetchMessages(page);
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

  async function handleExpand(msg: Message) {
    if (expanded === msg.id) {
      setExpanded(null);
      return;
    }
    setExpanded(msg.id);
    if (!msg.is_read && token) {
      try {
        await adminPatch(`${ADMIN}/messages/${msg.id}/`, token, {
          is_read: true,
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
        );
      } catch {
        // Non-critical
      }
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this message permanently?")) return;
    if (!token) return;
    setDeletingId(id);
    try {
      await adminDelete(`${ADMIN}/messages/${id}/`, token);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setCount((c) => c - 1);
      if (expanded === id) setExpanded(null);
    } catch {
      alert("Failed to delete message.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
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
        <span className="ml-auto text-gray-500 text-xs">{count} messages</span>
      </div>

      {/* List */}
      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {!initialised ? null : messages.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">No messages found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${
                    expanded === msg.id
                      ? "bg-white/[0.03]"
                      : "hover:bg-white/[0.02]"
                  }`}
                  onClick={() => handleExpand(msg)}
                >
                  <div className="mt-1.5 shrink-0">
                    {!msg.is_read ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-transparent block" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${msg.is_read ? "text-gray-300" : "text-white"}`}
                        >
                          {msg.name}
                        </p>
                        <p className="text-gray-500 text-xs">{msg.email}</p>
                      </div>
                      <span className="text-gray-600 text-xs whitespace-nowrap shrink-0">
                        {new Date(msg.created_at).toLocaleDateString("fi-FI")}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-0.5 truncate ${msg.is_read ? "text-gray-500" : "text-gray-300"}`}
                    >
                      {msg.subject || "(no subject)"}
                    </p>
                  </div>
                </div>

                {expanded === msg.id && (
                  <div className="px-5 pb-5 bg-white/[0.02] border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                          From
                        </p>
                        <p className="text-white text-sm font-medium">
                          {msg.name}
                        </p>
                        <p className="text-gray-400 text-xs">{msg.email}</p>
                        {msg.phone && (
                          <p className="text-gray-400 text-xs">{msg.phone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">
                          Subject
                        </p>
                        <p className="text-gray-300 text-sm">
                          {msg.subject || "(no subject)"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">
                        Message
                      </p>
                      <div className="bg-gray-800/60 rounded-xl px-4 py-3">
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        to={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "")}`}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-xs rounded-xl transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail size={16} /> Reply via email
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(msg.id);
                        }}
                        disabled={deletingId === msg.id}
                        className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-xl transition-colors disabled:opacity-50"
                      >
                        {deletingId === msg.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-xs">
            Page {page} of {totalPages}
          </p>
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
