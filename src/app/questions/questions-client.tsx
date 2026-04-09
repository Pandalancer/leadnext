"use client";

import type { UserRole } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle,
  Info,
} from "lucide-react";

import {
  MAX_INITIAL_LEAD_QUESTIONS,
  MIN_INITIAL_LEAD_QUESTIONS,
  hasValidInitialLeadQuestionCount,
  type InitialLeadQuestion,
} from "@/lib/initial-lead-questions";

const PLACEHOLDER_EXAMPLES = [
  "Which product or service are you interested in?",
  "What quantity or volume do you require?",
  "What is your budget range?",
  "When do you need delivery / when is your target date?",
  "Which city or region are you based in?",
  "Any specific requirements or preferences?",
];

interface QuestionsClientProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  questions: InitialLeadQuestion[];
}

export default function QuestionsClient({ user, questions: initialQuestions }: QuestionsClientProps) {
  const [questions, setQuestions] = useState<InitialLeadQuestion[]>(initialQuestions);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const addQuestion = () => {
    if (questions.length >= MAX_INITIAL_LEAD_QUESTIONS) return;
    setQuestions([...questions, { id: crypto.randomUUID(), question: "" }]);
    setSaveSuccess(false);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    setSaveSuccess(false);
    setSaveError("");
  };

  const updateQuestion = (id: string, value: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, question: value } : q)));
    setSaveSuccess(false);
    setSaveError("");
  };

  const handleSave = async () => {
    const nonEmpty = questions.filter((q) => q.question.trim());
    if (!hasValidInitialLeadQuestionCount(nonEmpty)) {
      setSaveError(
        `Configure between ${MIN_INITIAL_LEAD_QUESTIONS} and ${MAX_INITIAL_LEAD_QUESTIONS} questions, or clear all to disable the questionnaire.`
      );
      return;
    }
    setSaveError("");
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: nonEmpty }),
      });
      if (res.ok) {
        setQuestions(nonEmpty);
        setSaveSuccess(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setSaveError((body as { error?: string }).error ?? "Failed to save questions.");
      }
    } catch {
      setSaveError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const configuredCount = questions.filter((q) => q.question.trim()).length;
  const atMax = questions.length >= MAX_INITIAL_LEAD_QUESTIONS;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6fafe" }}>
      <Sidebar
        userRole={user.role}
        userName={user.name ?? undefined}
        userEmail={user.email ?? undefined}
      />

      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header style={{
          background: "rgba(246, 250, 254, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "0 1.5rem",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 24px 48px rgba(23,28,31,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/dashboard" style={{
                background: "none",
                border: "none",
                color: "#171c1f",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                textDecoration: "none",
              }}>
                <ArrowLeft size={20} />
                Back
              </Link>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "#171c1f", margin: 0 }}>
              Lead Questions
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "700",
              border: "2px solid #10b981",
            }}>
              {user.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) : "U"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
        }}>
          {/* Page Header */}
          <section>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.5rem 0.75rem",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#059669",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1rem",
            }}>
              Admin Configuration
            </div>
            <h3 style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              color: "#171c1f",
              margin: "0 0 0.5rem",
              letterSpacing: "-0.025em",
            }}>
              Lead Intake Questions
            </h3>
            <p style={{
              color: "#637381",
              fontSize: "1.125rem",
              maxWidth: "600px",
              lineHeight: 1.6,
            }}>
              Define up to {MAX_INITIAL_LEAD_QUESTIONS} questions that are asked for every new lead. Capture the details you need — product interest, quantity, budget — so you can respond with the right information in a single shot.
            </p>
          </section>

          {/* Info banner */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            background: "rgba(59, 130, 246, 0.07)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "0.75rem",
            padding: "1rem 1.25rem",
          }}>
            <Info size={18} style={{ color: "#3b82f6", flexShrink: 0, marginTop: "0.1rem" }} />
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>
              These questions are shown globally to every new lead when they are being added manually.
              Their answers are saved with the lead record and visible on the lead detail page.
              Leave all questions empty to disable the questionnaire.
            </p>
          </div>

          {/* Questions card */}
          <div style={{
            background: "white",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.02)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <HelpCircle size={20} style={{ color: "#059669" }} />
                <h4 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#171c1f", margin: 0 }}>
                  Questions
                  <span style={{
                    marginLeft: "0.625rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#64748b",
                    background: "#f1f5f9",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "9999px",
                  }}>
                    {configuredCount} / {MAX_INITIAL_LEAD_QUESTIONS}
                  </span>
                </h4>
              </div>
              <button
                type="button"
                onClick={addQuestion}
                disabled={atMax}
                style={{
                  background: atMax ? "#e2e8f0" : "linear-gradient(135deg, #006948, #00855d)",
                  color: atMax ? "#94a3b8" : "white",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.625rem",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: atMax ? "not-allowed" : "pointer",
                  boxShadow: atMax ? "none" : "0 4px 6px rgba(16,185,129,0.2)",
                }}
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "#94a3b8",
                border: "2px dashed #e2e8f0",
                borderRadius: "1rem",
              }}>
                <HelpCircle size={40} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: "500" }}>No questions configured.</p>
                <p style={{ margin: "0.375rem 0 0", fontSize: "0.8125rem" }}>
                  Click &ldquo;Add Question&rdquo; to get started.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <span style={{
                      width: "28px",
                      height: "28px",
                      background: "#f1f5f9",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "#475569",
                      flexShrink: 0,
                    }}>
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      aria-label={`Question ${index + 1}`}
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, e.target.value)}
                      placeholder={PLACEHOLDER_EXAMPLES[index] ?? `Question ${index + 1}`}
                      style={{
                        width: "100%",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.625rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        color: "#171c1f",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.625rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                      aria-label={`Remove question ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {atMax && (
              <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                Maximum of {MAX_INITIAL_LEAD_QUESTIONS} questions reached.
              </p>
            )}
          </div>

          {/* Feedback messages */}
          {saveError && (
            <p style={{
              margin: 0,
              padding: "0.875rem 1.25rem",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              color: "#b91c1c",
              fontWeight: 500,
            }}>
              {saveError}
            </p>
          )}
          {saveSuccess && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.875rem 1.25rem",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              color: "#15803d",
              fontWeight: 500,
            }}>
              <CheckCircle size={16} />
              Questions saved successfully.
            </div>
          )}

          {/* Save button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "0.75rem 2rem",
                background: saving ? "#059669" : "linear-gradient(135deg, #006948, #00855d)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 6px rgba(16,185,129,0.2)",
              }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Questions"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
