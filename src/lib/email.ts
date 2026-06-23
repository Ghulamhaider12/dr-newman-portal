import sgMail from "@sendgrid/mail";

/**
 * New-comment notification to the admin. Fail-soft: any error is swallowed and
 * logged so a visitor's comment submission is never blocked.
 */
const API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM = process.env.SENDGRID_FROM_EMAIL || "";
const ADMIN = process.env.ADMIN_NOTIFY_EMAIL || "";

if (API_KEY) {
  sgMail.setApiKey(API_KEY);
}

export async function notifyNewComment(opts: {
  fileTitle: string;
  fileId: number;
  email: string;
  content: string;
  isPublic: boolean;
}): Promise<void> {
  if (!API_KEY || !FROM || !ADMIN) {
    console.info(
      "[email] SendGrid not configured — skipping new-comment notification."
    );
    return;
  }
  try {
    await sgMail.send({
      to: ADMIN,
      from: FROM,
      subject: `New comment awaiting review — "${opts.fileTitle}"`,
      text: [
        `A new ${opts.isPublic ? "public" : "private"} comment was submitted.`,
        ``,
        `File: ${opts.fileTitle} (#${opts.fileId})`,
        `From: ${opts.email}`,
        ``,
        opts.content,
        ``,
        `Review it in the admin panel under Comment Moderation.`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("[email] Failed to send comment notification:", err);
  }
}
