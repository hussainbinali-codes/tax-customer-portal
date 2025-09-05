"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Clock,
  MessageSquare,
  Paperclip,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";

// Consistent date formatting function
function formatDate(iso) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
}

// Consistent date-time formatting function
function formatDateTime(iso) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

function StatusPill({ status }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium";
  const tone =
    status === "Filed"
      ? "bg-green-100 text-green-800"
      : status === "In Progress"
      ? "bg-amber-100 text-amber-800"
      : "bg-blue-100 text-blue-800";
  return <span className={`${base} ${tone}`}>{status}</span>;
}

function DocIcon({ type, className }) {
  const c = `h-5 w-5 ${className || ""}`;
  if (type === "pdf") return <FileText className={c} />;
  if (type === "csv") return <FileSpreadsheet className={c} />;
  if (type === "zip") return <FileArchive className={c} />;
  if (type === "image") return <FileImage className={c} />;
  return <FileText className={c} />;
}

export default function CustomerDetail() {
  const [isClient, setIsClient] = useState(false);
  const {id} = useParams();
  console.log(id , 'id')
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const customer = {
    id: "cust_001",
    name: "Test Customer",
    email: "test@example.com",
    mobile: "(555) 101-2020",
    createdAt: "2025-07-12T10:05:00Z",
    updatedAt: "2025-08-20T16:40:00Z",
  };

  const returns = [
    {
      id: "ret_1040",
      name: "tax 1 1040",
      type: "Individual",
      status: "In Progress",
      updatedAt: "2025-08-18T12:00:00Z",
      details:
        "Gathered W‑2 and 1099 forms. Pending review of Schedule C expenses and charity deductions.",
    },
    {
      id: "ret_1080",
      name: "tax 1080",
      type: "Business",
      status: "Filed",
      updatedAt: "2025-07-28T09:15:00Z",
      details:
        "Filed with confirmation number #A1B2C3. Awaiting IRS acknowledgement.",
    },
  ];

  const initialDocs = [
    {
      id: "doc1",
      name: "W2_2024.pdf",
      type: "pdf",
      uploadedAt: "2025-08-01T14:00:00Z",
    },
    {
      id: "doc2",
      name: "1099.csv",
      type: "csv",
      uploadedAt: "2025-08-03T09:30:00Z",
    },
    {
      id: "doc3",
      name: "Receipts_Q1.zip",
      type: "zip",
      uploadedAt: "2025-08-05T11:10:00Z",
    },
    {
      id: "doc4",
      name: "HomeOffice.jpg",
      type: "image",
      uploadedAt: "2025-08-09T08:25:00Z",
    },
    {
      id: "doc5",
      name: "ScheduleC.pdf",
      type: "pdf",
      uploadedAt: "2025-08-10T16:40:00Z",
    },
  ];

  const initialComments = [
    {
      id: "c1",
      user: "Chris Doe",
      content:
        "Uploaded W‑2 and Schedule C. Please confirm if anything is missing.",
      createdAt: "2025-08-12T10:42:00Z",
      attachments: [initialDocs[0], initialDocs[4]],
    },
    {
      id: "c2",
      user: "Alex TaxPro",
      content: "Looks good. I need the Q2 receipts to finalize deductions.",
      createdAt: "2025-08-13T15:05:00Z",
    },
  ];

  const [openReturnId, setOpenReturnId] = useState(null);
  const [pricingMode, setPricingMode] = useState("hourly");
  const [hourlyRate, setHourlyRate] = useState(130);
  const [lumpSum, setLumpSum] = useState(650);
  const [docs] = useState(initialDocs);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [composerAttachments, setComposerAttachments] = useState([]);
  const commentInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Create initial timeline with comments integrated
  const initialTimeline = [
    {
      id: "a1",
      label: "Customer created",
      at: customer.createdAt,
      type: "event",
    },
    {
      id: "a2",
      label: "Initial documents uploaded",
      at: "2025-08-01T14:00:00Z",
      type: "event",
    },
    {
      id: "a3",
      label: "Return 1080 filed",
      at: "2025-07-28T09:15:00Z",
      type: "event",
    },
    ...initialComments.map((comment) => ({
      id: comment.id,
      label: "Comment added",
      at: comment.createdAt,
      type: "comment",
      user: comment.user,
      content: comment.content,
      attachments: comment.attachments,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)); // Sort by date, newest first

  const [timeline, setTimeline] = useState(initialTimeline);

  function addComment() {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: `c_${Date.now()}`,
      user: "You",
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      attachments: composerAttachments.length
        ? [...composerAttachments]
        : undefined,
    };

    // Add to comments
    setComments((prev) => [newCommentObj, ...prev]);

    // Add to timeline
    const timelineItem = {
      id: newCommentObj.id,
      label: "Comment added",
      at: newCommentObj.createdAt,
      type: "comment",
      user: newCommentObj.user,
      content: newCommentObj.content,
      attachments: newCommentObj.attachments,
    };

    setTimeline((prev) =>
      [timelineItem, ...prev].sort((a, b) => new Date(b.at) - new Date(a.at))
    );

    // Reset form
    setNewComment("");
    setComposerAttachments([]);
  }

  function onFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const created = files.map((f, i) => ({
      id: `att_${Date.now()}_${i}`,
      name: f.name,
      type: "other",
      uploadedAt: new Date().toISOString(),
    }));
    setComposerAttachments((prev) => [...prev, ...created]);
    e.currentTarget.value = "";
  }
  

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 hover:bg-gray-100"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-balance text-2xl font-bold text-gray-900">
              {customer.name}
            </h1>
            <p className="text-sm text-gray-600">Customer details</p>
          </div>
        </div>
        {isClient && (
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Created {formatDate(customer.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>Updated {formatDate(customer.updatedAt)}</span>
            </div>
          </div>
        )}
      </header>

      {/* Tax return rows */}
      <section className="space-y-3">
        {returns.map((r) => {
          const isOpen = openReturnId === r.id;
          return (
            <div
              key={r.id}
              className="rounded-md border border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    className="rounded p-1 hover:bg-gray-100"
                    onClick={() => setOpenReturnId(isOpen ? null : r.id)}
                    aria-label={isOpen ? "Hide details" : "Show details"}
                    title={isOpen ? "Hide details" : "Show details"}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <div className="text-gray-900">{r.name}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">status:</span>
                  <StatusPill status={r.status} />
                  <button
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => setOpenReturnId(isOpen ? null : r.id)}
                  >
                    show details
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t">
                  <div className="grid items-start gap-4 p-4 md:grid-cols-4 md:p-6">
                    {/* Left: return details + docs */}
                    <div className="md:col-span-3 rounded-md border border-gray-200 bg-white">
                      <div className="p-4 md:p-6">
                        <h2 className="mb-2 text-lg font-semibold text-gray-900">
                          Return details
                        </h2>
                        <p className="text-pretty text-sm leading-6 text-gray-700">
                          {r.details}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <div className="text-gray-500">Return</div>
                            <div className="font-medium text-gray-900">
                              {r.name}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Type</div>
                            <div className="font-medium text-gray-900">
                              {r.type}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Last updated</div>
                            <div className="font-medium text-gray-900">
                              {isClient ? formatDate(r.updatedAt) : formatDate(r.updatedAt)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Status</div>
                            <StatusPill status={r.status} />
                          </div>
                        </div>
                      </div>

                      {/* Documents ribbon */}
                      <div className="border-t border-gray-200 p-4 md:p-5">
                        <div className="mb-2 text-sm font-medium text-gray-900">
                          Documents
                        </div>
                        <div className="flex items-stretch gap-4 overflow-x-auto">
                          {docs.map((d) => (
                            <div
                              key={d.id}
                              className="group relative flex h-16 w-24 shrink-0 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100"
                              title={d.name}
                              onClick={() => alert(`Preview ${d.name}`)}
                            >
                              <DocIcon
                                type={d.type}
                                className="text-gray-600 h-5 w-5"
                              />
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {d.name.length > 14
                                  ? d.name.slice(0, 14) + "…"
                                  : d.name}
                              </div>
                              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  className="rounded bg-white/90 p-1 hover:bg-white"
                                  aria-label="View"
                                  title="View"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Viewing ${d.name}`);
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5 text-gray-700" />
                                </button>
                                <button
                                  className="rounded bg-white/90 p-1 hover:bg-white"
                                  aria-label="Download"
                                  title="Download"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Downloading ${d.name}`);
                                  }}
                                >
                                  <Download className="h-3.5 w-3.5 text-gray-700" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: pricing card */}
                    <aside className="self-start rounded-md border border-gray-200 bg-white p-4 md:p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pricing
                        </h3>
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        <button
                          onClick={() => setPricingMode("hourly")}
                          className={`rounded-md px-3 py-1.5 text-sm ${
                            pricingMode === "hourly"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Hourly
                        </button>
                        <button
                          onClick={() => setPricingMode("lump")}
                          className={`rounded-md px-3 py-1.5 text-sm ${
                            pricingMode === "lump"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Lump Sum
                        </button>
                      </div>

                      {pricingMode === "hourly" ? (
                        <div className="mb-4">
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Hourly Rate ($)
                          </label>
                          <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) =>
                              setHourlyRate(Number(e.target.value))
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <div className="mb-4">
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Lump Sum ($)
                          </label>
                          <input
                            type="number"
                            value={lumpSum}
                            onChange={(e) => setLumpSum(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                      <button
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        onClick={() =>
                          alert(
                            `Saved pricing: ${
                              pricingMode === "hourly"
                                ? `$${hourlyRate}/hr`
                                : `$${lumpSum} lump sum`
                            }`
                          )
                        }
                      >
                        Save Pricing
                      </button>
                    </aside>

                    {/* Comment composer + Activities timeline */}
                    <div className="md:col-span-4 rounded-md border border-gray-200 bg-white p-4 md:p-6">
                      <div className="grid gap-6">
                        {/* Comment composer */}
                        <div className="rounded-md border border-gray-200 bg-white p-3 md:p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              Add Comment
                            </span>
                          </div>
                          <div className="mb-3">
                            <label
                              htmlFor={`new-comment-${r.id}`}
                              className="sr-only"
                            >
                              New comment
                            </label>
                            <textarea
                              id={`new-comment-${r.id}`}
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment…"
                              rows={4}
                              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {/* Inline actions inside composer */}
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  multiple
                                  className="sr-only"
                                  onChange={onFilesSelected}
                                />
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                  title="Attach documents"
                                >
                                  <Paperclip className="h-4 w-4" />
                                  Attach
                                </button>
                                {composerAttachments.map((a) => (
                                  <span
                                    key={a.id}
                                    className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                                  >
                                    <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                                    {a.name}
                                    <button
                                      type="button"
                                      aria-label="Remove attachment"
                                      className="rounded p-0.5 hover:bg-gray-200"
                                      onClick={() =>
                                        setComposerAttachments((prev) =>
                                          prev.filter((d) => d.id !== a.id)
                                        )
                                      }
                                    >
                                      <X className="h-3 w-3 text-gray-500" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={addComment}
                                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                title="Post comment"
                              >
                                Post Comment
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Activities timeline with comments */}
                        <div className="rounded-md border border-gray-200 bg-white p-3 md:p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              Activities timeline
                            </span>
                          </div>
                          <ol className="relative mt-3 max-h-96 overflow-y-auto">
                            {timeline.map((t, index) => (
                              <li key={t.id} className=" flex">
                                <div className="flex flex-col items-center flex-shrink-0 mr-4">
                                  {index !== 0 && (
                                    <div className="w-0.5 h-4 bg-blue-100 mb-1"></div>
                                  )}

                                  <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100 z-10"></div>

                                  {index !== timeline.length - 1 && (
                                    <div className="w-0.5 h-4 bg-blue-100 mt-1 flex-grow"></div>
                                  )}
                                </div>

                                {/* Timeline content */}
                                <div className="flex-1 min-w-0">
                                  {t.type === "comment" ? (
                                    <div className=" p-3 rounded-md">
                                      <div className="mb-1 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700">
                                            {t.user.charAt(0).toUpperCase()}
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">
                                            {t.user}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {isClient ? formatDateTime(t.at) : formatDateTime(t.at)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700">
                                        {t.content}
                                      </p>
                                      {t.attachments &&
                                        t.attachments.length > 0 && (
                                          <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {t.attachments.map((a) => (
                                              <span
                                                key={a.id}
                                                className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                                              >
                                                <Paperclip className="h-3.5 w-3.5 text-gray-500" />
                                                {a.name}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-sm font-medium text-gray-900">
                                        {t.label}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {isClient ? formatDateTime(t.at) : formatDateTime(t.at)}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}