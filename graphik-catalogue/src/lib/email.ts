import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

const GRAPHIK_EMAILS = [
  process.env.GRAPHIK_EMAIL_1 ?? "remy.haller@graphik.fr",
  process.env.GRAPHIK_EMAIL_2 ?? "franck.bellamy@graphik.fr",
].filter(Boolean)

/**
 * Email envoyé à l'équipe Graphik quand un brief est soumis
 */
export async function sendBriefSubmittedEmail({
  briefId,
  storeName,
  clientName,
  clientEmail,
  totalHT,
  requestedDeliveryWeek,
  dashboardUrl,
}: {
  briefId: string
  storeName: string
  clientName: string
  clientEmail: string
  totalHT: number
  requestedDeliveryWeek: string
  dashboardUrl: string
}) {
  if (process.env.NODE_ENV === "development") {
    console.log("\n==================================")
    console.log("📧 EMAIL (dev) — Brief soumis:")
    console.log(`  Store: ${storeName}`)
    console.log(`  Client: ${clientName} <${clientEmail}>`)
    console.log(`  Total HT: ${formatPrice(totalHT)}`)
    console.log(`  Dashboard: ${dashboardUrl}`)
    console.log("==================================\n")
    return
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: GRAPHIK_EMAILS,
    subject: `Nouveau brief — ${storeName}`,
    html: emailTemplate({
      title: `Nouveau brief reçu`,
      subtitle: `${storeName} vient de soumettre une demande de devis.`,
      body: `
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0; color: #666;">Magasin</td><td style="padding: 8px 0; font-weight: 600;">${storeName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Contact</td><td style="padding: 8px 0;">${clientName} — ${clientEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Semaine souhaitée</td><td style="padding: 8px 0;">${requestedDeliveryWeek}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Total HT estimé</td><td style="padding: 8px 0; font-weight: 600; font-size: 18px;">${formatPrice(totalHT)}</td></tr>
        </table>
      `,
      ctaUrl: dashboardUrl,
      ctaLabel: "Voir le brief →",
    }),
  })
}

/**
 * Email envoyé au client quand son brief est renvoyé pour correction
 */
export async function sendBriefReviewingEmail({
  clientEmail,
  clientName,
  storeName,
  catalogueUrl,
}: {
  clientEmail: string
  clientName: string
  storeName: string
  catalogueUrl: string
}) {
  if (process.env.NODE_ENV === "development") {
    console.log("\n==================================")
    console.log("📧 EMAIL (dev) — Brief en révision:")
    console.log(`  Client: ${clientName} <${clientEmail}>`)
    console.log(`  Catalogue: ${catalogueUrl}`)
    console.log("==================================\n")
    return
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: [clientEmail],
    subject: `Votre brief nécessite des corrections — ${storeName}`,
    html: emailTemplate({
      title: "Votre brief nécessite des ajustements",
      subtitle: `L'équipe Graphik a besoin de quelques modifications sur votre demande pour ${storeName}.`,
      body: `<p style="color: #666; line-height: 1.6;">Connectez-vous à votre espace pour consulter les corrections demandées et mettre à jour votre sélection.</p>`,
      ctaUrl: catalogueUrl,
      ctaLabel: "Modifier mon brief →",
    }),
  })
}

/**
 * Email envoyé au client quand son brief est validé
 */
export async function sendBriefValidatedEmail({
  clientEmail,
  clientName,
  storeName,
}: {
  clientEmail: string
  clientName: string
  storeName: string
}) {
  if (process.env.NODE_ENV === "development") {
    console.log("\n==================================")
    console.log("📧 EMAIL (dev) — Brief validé:")
    console.log(`  Client: ${clientName} <${clientEmail}>`)
    console.log("==================================\n")
    return
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: [clientEmail],
    subject: `Votre devis est validé — ${storeName}`,
    html: emailTemplate({
      title: "Votre devis est validé ! 🎉",
      subtitle: `L'équipe Graphik a validé votre demande pour ${storeName}. Nous reviendrons vers vous prochainement pour la suite.`,
      body: "",
      ctaUrl: "",
      ctaLabel: "",
    }),
  })
}

// ─── Utilitaires ────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

function emailTemplate({
  title,
  subtitle,
  body,
  ctaUrl,
  ctaLabel,
}: {
  title: string
  subtitle: string
  body: string
  ctaUrl: string
  ctaLabel: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f5f5f5;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="border-left: 4px solid #1a1a1a; padding-left: 16px; margin-bottom: 32px;">
          <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999;">GRAPHIK</p>
          <h1 style="margin: 4px 0 0; font-size: 22px; color: #1a1a1a;">${title}</h1>
        </div>
        <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">${subtitle}</p>
        ${body}
        ${ctaUrl ? `<a href="${ctaUrl}" style="display: inline-block; background: #1a1a1a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin-top: 8px;">${ctaLabel}</a>` : ""}
        <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
        <p style="color: #aaa; font-size: 12px; margin: 0;">Graphik · Solutions de signalétique pour Decathlon</p>
      </div>
    </body>
    </html>
  `
}
