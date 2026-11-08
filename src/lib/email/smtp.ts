import nodemailer from "nodemailer";
import { isSmtpConfigured, smtpAuthUser } from "@/lib/env";

export type MailPurpose = "welcome" | "support" | "sales";

type MailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  purpose?: MailPurpose;
};

const transporters = new Map<string, nodemailer.Transporter>();

function envTrim(key: string) {
  return process.env[key]?.trim() ?? "";
}

function purposeSuffix(purpose?: MailPurpose) {
  if (!purpose) return "";
  return `_${purpose.toUpperCase()}`;
}

function resolveAuth(purpose?: MailPurpose) {
  const suffix = purposeSuffix(purpose);
  const user = envTrim(`SMTP_USER${suffix}`) || smtpAuthUser();
  const pass = envTrim(`SMTP_PASS${suffix}`) || envTrim("SMTP_PASS");
  return { user, pass };
}

function resolveFrom(purpose?: MailPurpose) {
  const suffix = purposeSuffix(purpose);
  return (
    envTrim(`SMTP_FROM${suffix}`) ||
    envTrim("SMTP_FROM") ||
    resolveAuth(purpose).user
  );
}

function transporterKey(purpose?: MailPurpose) {
  const { user } = resolveAuth(purpose);
  const host = envTrim("SMTP_HOST");
  const port = envTrim("SMTP_PORT") || "465";
  return `${host}:${port}:${user}`;
}

function getTransporter(purpose?: MailPurpose) {
  if (!isSmtpConfigured()) return null;
  const { user, pass } = resolveAuth(purpose);
  if (!user || !pass) return null;

  const key = transporterKey(purpose);
  const cached = transporters.get(key);
  if (cached) return cached;

  const port = Number(envTrim("SMTP_PORT") || 465);
  const secure =
    String(process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false")).toLowerCase() ===
    "true";
  const created = nodemailer.createTransport({
    host: envTrim("SMTP_HOST"),
    port,
    secure,
    auth: { user, pass },
  });
  transporters.set(key, created);
  return created;
}

export async function sendMail(input: MailInput) {
  const mailer = getTransporter(input.purpose);
  if (!mailer) {
    console.info("[smtp:skipped]", {
      to: input.to,
      subject: input.subject,
      purpose: input.purpose ?? "default",
    });
    return { skipped: true as const };
  }
  await mailer.sendMail({
    from: resolveFrom(input.purpose),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  return { skipped: false as const };
}

/** Map notification events to the mailbox that should send them. */
export function purposeForEvent(event: string): MailPurpose {
  if (
    event === "domain_registered" ||
    event === "domain_transfer_started" ||
    event === "payment_successful" ||
    event === "payment_failed" ||
    event === "hosting_created"
  ) {
    return "sales";
  }
  if (event === "account_welcome" || event === "admin_welcome") {
    return "welcome";
  }
  return "support";
}
