import nodemailer from "nodemailer";

export default async (req) => {
  try {
    const { payload } = await req.json();

    const { form_name, data, created_at } = payload;

    // Only process the contact form
    if (form_name !== "contact") {
      return new Response("Ignored: not the contact form", { status: 200 });
    }

    const recipientEmail =
      process.env.NOTIFICATION_EMAIL || "sendigitalinnov@outlook.com";
    const senderEmail = process.env.SMTP_USER || recipientEmail;
    const senderPassword = process.env.SMTP_PASSWORD;

    if (!senderPassword) {
      console.error(
        "SMTP_PASSWORD environment variable is not set. Cannot send email notification."
      );
      return new Response("SMTP_PASSWORD not configured", { status: 500 });
    }

    const smtpHost = process.env.SMTP_HOST || "smtp-mail.outlook.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
    });

    const name = data.name || "Inconnu";
    const email = data.email || "Non fourni";
    const phone = data.phone || "Non fourni";
    const service = data.service || "Non spécifié";
    const message = data.message || "Aucun message";
    const date = new Date(created_at).toLocaleString("fr-FR", {
      timeZone: "Africa/Dakar",
      dateStyle: "full",
      timeStyle: "short",
    });

    const subject = `Nouveau message de ${name} - SEN Digital Innovation`;

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #ff6209 0%, #ff8a3d 100%); padding: 24px 32px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Nouveau message reçu</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 14px;">${date}</p>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333; width: 140px; vertical-align: top;">Nom</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #555;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333; vertical-align: top;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${email}" style="color: #ff6209; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333; vertical-align: top;">Téléphone</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #555;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #333; vertical-align: top;">Service</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: #555;">${service}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: 600; color: #333; vertical-align: top;">Message</td>
              <td style="padding: 12px 0; color: #555; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</td>
            </tr>
          </table>
        </div>
        <div style="background: #f9f9f9; padding: 16px 32px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #999;">Ce message a été envoyé depuis le formulaire de contact de SEN Digital Innovation</p>
        </div>
      </div>
    `;

    const textBody = `Nouveau message reçu - SEN Digital Innovation
Date: ${date}

Nom: ${name}
Email: ${email}
Téléphone: ${phone}
Service: ${service}

Message:
${message}`;

    await transporter.sendMail({
      from: `"SEN Digital Innovation" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`Email notification sent to ${recipientEmail} for submission from ${name}`);
    return new Response("Email sent successfully", { status: 200 });
  } catch (error) {
    console.error("Error sending email notification:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
