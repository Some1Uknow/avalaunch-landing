"use client";

import { FormEvent, useState, useTransition } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{
    kind: "idle" | "success" | "error";
    message: string;
  }>({ kind: "idle", message: "" });
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message: string };

      if (!response.ok) {
        setStatus({ kind: "error", message: data.message });
        return;
      }

      setStatus({ kind: "success", message: data.message });
      setEmail("");
    });
  }

  return (
    <form className="waitlist-card" onSubmit={onSubmit}>
      <div className="waitlist-header">
        <span className="waitlist-badge">Early operator access</span>
        <p>
          Leave your email to get the first private build and launch-readiness
          updates.
        </p>
      </div>
      <label className="field-shell">
        <span>Email</span>
        <input
          aria-label="Email address"
          autoComplete="email"
          inputMode="email"
          placeholder="team@company.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <button className="waitlist-button" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Request access"}
      </button>
      <p className={`form-status ${status.kind}`}>
        {status.message || "No spam. Only product updates and early access notes."}
      </p>
    </form>
  );
}
