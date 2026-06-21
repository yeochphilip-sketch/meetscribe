"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, CheckCircle } from "lucide-react";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setMessage("");
        setEmail("");
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
        }, 2500);
      } else {
        throw new Error("Failed to submit");
      }
    } catch (err) {
      alert("Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all flex items-center justify-center group"
          aria-label="Open feedback"
        >
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]">
          <div className="rounded-2xl border border-white/10 bg-[#111118]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-white">Send feedback</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close feedback"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {submitted ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-white font-medium">Thanks for your feedback!</p>
                  <p className="text-sm text-gray-500 mt-1">We will look into it.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    {[
                      { id: "bug", label: "Bug" },
                      { id: "feature", label: "Feature" },
                      { id: "other", label: "Other" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCategory(opt.id)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          category === opt.id
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What is wrong? What can we improve?"
                      rows={4}
                      required
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email (optional)"
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send feedback
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
