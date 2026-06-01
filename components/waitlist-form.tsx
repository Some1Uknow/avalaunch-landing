"use client";

import { FormEvent, useState, useTransition } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
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
        body: JSON.stringify({
          email,
          companyWebsite,
          source: "landing-page",
        }),
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
      <span className="waitlist-badge">Early access</span>
      <p>Leave your email — we’ll send the private build + launch updates.</p>
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
    <input
      aria-hidden="true"
      autoComplete="off"
      name="companyWebsite"
      onChange={(event) => setCompanyWebsite(event.target.value)}
      tabIndex={-1}
      type="text"
      value={companyWebsite}
      className="sr-only"
    />
    <button className="waitlist-button" disabled={isPending} type="submit">
      {isPending ? "Saving..." : "Join waitlist"}
    </button>
    <p className={`form-status ${status.kind}`}>
      {status.message || "No spam. Just access + changelogs."}
    </p>
    </form>
  );
}
