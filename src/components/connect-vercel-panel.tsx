"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  VERCEL_APEX_A,
  VERCEL_NAMESERVERS,
  VERCEL_WWW_CNAME_DEFAULT,
} from "@/lib/vercel-dns";

export function ConnectVercelPanel({
  domainId,
  domainName,
}: {
  domainId: string;
  domainName: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"records" | "nameservers">("records");
  const [wwwCname, setWwwCname] = useState(VERCEL_WWW_CNAME_DEFAULT);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  async function apply() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/domains/${domainId}/connect-vercel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          wwwCname: method === "records" ? wwwCname : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Could not apply Vercel settings.");
        return;
      }
      setMessage(
        method === "records"
          ? "DNS records applied. Finish adding the domain in Vercel if you have not already."
          : "Nameservers updated. Finish setup in the Vercel Domains panel.",
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-5 p-5" id="connect">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="page-kicker">Vercel</p>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--navy)]">Connect {domainName}</h2>
        </div>
        <a className="btn btn-ghost" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">
          Open Vercel
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <ol className="space-y-2 text-sm text-[var(--muted)]">
        <li>
          Add{" "}
          <strong className="text-[var(--ink)]">{domainName}</strong> and{" "}
          <strong className="text-[var(--ink)]">www.{domainName}</strong> in{" "}
          <a
            className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
            href="https://vercel.com/docs/domains/working-with-domains/add-a-domain"
            target="_blank"
            rel="noreferrer"
          >
            Vercel project settings
            <ExternalLink className="ml-1 inline h-3.5 w-3.5" />
          </a>
          .
        </li>
        <li>Pick a connection method below, then apply.</li>
        <li>Wait until Vercel shows a valid configuration.</li>
      </ol>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`btn ${method === "records" ? "btn-dark" : "btn-ghost"}`}
          onClick={() => setMethod("records")}
        >
          Keep DNS here
        </button>
        <button
          type="button"
          className={`btn ${method === "nameservers" ? "btn-dark" : "btn-ghost"}`}
          onClick={() => setMethod("nameservers")}
        >
          Use Vercel nameservers
        </button>
      </div>

      {method === "records" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">
            Sets an A record for the root and a CNAME for www. Change the www target if Vercel shows a different value.
          </p>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Host</th>
                  <th>Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A</td>
                  <td>@</td>
                  <td className="font-mono text-sm">{VERCEL_APEX_A}</td>
                  <td>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
                      onClick={() => copy(VERCEL_APEX_A, "a")}
                    >
                      {copied === "a" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>CNAME</td>
                  <td>www</td>
                  <td>
                    <input
                      className="w-full min-w-[12rem] rounded-lg border border-[var(--line)] px-2 py-1.5 font-mono text-sm"
                      value={wwwCname}
                      onChange={(event) => setWwwCname(event.target.value)}
                      placeholder={VERCEL_WWW_CNAME_DEFAULT}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
                      onClick={() => copy(wwwCname, "cname")}
                    >
                      {copied === "cname" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      Copy
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">
            Moves DNS management to Vercel. Add email MX records there again if you need them.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {VERCEL_NAMESERVERS.map((ns) => (
              <div
                key={ns}
                className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--field-bg)] px-3 py-2 font-mono text-sm font-semibold"
              >
                {ns}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)]"
                  onClick={() => copy(ns, ns)}
                >
                  {copied === ns ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-hot" disabled={busy} onClick={apply}>
          {busy ? "Applying…" : method === "records" ? "Apply DNS" : "Apply nameservers"}
        </button>
      </div>
      {message ? <p className="text-sm font-semibold text-[var(--success)]">{message}</p> : null}
    </section>
  );
}
