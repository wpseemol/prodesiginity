"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCareerEmail = void 0;
const resend_1 = require("resend");
const sendCareerEmail = async (req, res) => {
    try {
        const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
        // Text fields
        const { name, email, phone, city, jobTitle, portfolioUrl, experienceYears, coverLetter, } = req.body;
        // Uploaded file from multer
        const file = req.file;
        // Format attachment for Resend
        const attachments = file
            ? [
                {
                    filename: file.originalname,
                    content: file.buffer, // Buffer from memoryStorage
                },
            ]
            : [];
        const { data, error } = await resend.emails.send({
            from: "ProDesignity Careers <onboarding@resend.dev>",
            to: [process.env.TARGET_MAIL || "careers@prodesignity.com"],
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
        });
        if (error) {
            res.status(500).json({ success: false, error: error.message });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Email sent successfully!",
            data,
        });
    }
    catch (err) {
        console.error("Error:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Internal server error",
        });
    }
};
exports.sendCareerEmail = sendCareerEmail;
