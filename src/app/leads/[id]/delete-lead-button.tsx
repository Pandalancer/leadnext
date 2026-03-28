"use client";

import { useRouter } from "next/navigation";

export default function DeleteLeadButton({ leadId }: { leadId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const ok = window.confirm(
      "Delete this lead? This cannot be undone and will remove its follow-ups and activity history."
    );
    if (!ok) return;

    const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/leads");
      router.refresh();
      return;
    }

    let message = "Failed to delete lead.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    window.alert(message);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.625rem 1.25rem",
        background: "transparent",
        color: "#b91c1c",
        border: "1px solid rgba(185, 28, 28, 0.35)",
        borderRadius: "0.75rem",
        fontSize: "0.875rem",
        fontWeight: "700",
        cursor: "pointer",
      }}
    >
      Delete
    </button>
  );
}

