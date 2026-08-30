import { Request, Response } from "express";
import nodemailer from "nodemailer";

// Configure Hostinger SMTP transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465 (SSL), false for 587 (TLS)
    auth: {
        user: process.env.SMTP_USER, // info@prodesignity.com
        pass: process.env.SMTP_PASS, // Your Hostinger mailbox password
    },
});

export const sendCareerEmail = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const {
            name,
            email,
            phone,
            city,
            jobTitle,
            portfolioUrl,
            experienceYears,
            coverLetter,
        } = req.body;

        const file = req.file;

        // Attach buffer from memory if uploaded
        const attachments = file
            ? [
                  {
                      filename: file.originalname,
                      content: file.buffer,
                  },
              ]
            : [];

        const mailOptions = {
            from: `"ProDesignity Careers" <${process.env.SMTP_USER || "info@prodesignity.com"}>`,
            to: process.env.TARGET_MAIL || "careers@prodesignity.com",
            replyTo: email,
            subject: `Job Application: ${jobTitle} — ${name}`,
            html: `
        <h2>New Application: ${jobTitle}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>WhatsApp Number:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Experience:</strong> ${experienceYears || "N/A"}</p>
        <p><strong>Portfolio:</strong> ${portfolioUrl || "N/A"}</p>
        <p><strong>Cover Letter:</strong> ${coverLetter || "N/A"}</p>
        <p><strong>Resume:</strong> ${file ? file.originalname : "No file attached"}</p>
      `,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Email sent successfully via Hostinger SMTP!",
            messageId: info.messageId,
        });
    } catch (err: any) {
        console.error("SMTP Error:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Failed to send email via SMTP",
        });
    }
};
