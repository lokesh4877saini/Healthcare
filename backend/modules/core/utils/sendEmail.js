const nodeMailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const sendEmail = async (options) => {
    try {
        // Define paths to templates
        const templatesDir = path.join(__dirname, '../../notification/templates');
        const baseTemplatePath = path.join(templatesDir, 'base.ejs');
        const templatePath = path.join(templatesDir, `${options.template}.ejs`);

        // Validate templates
        if (!fs.existsSync(templatePath)) {
            console.error(`Template not found: ${templatePath}`);
            return false;
        }

        if (!fs.existsSync(baseTemplatePath)) {
            console.error(`Base template not found: ${baseTemplatePath}`);
            return false;
        }

        // Read and render the specific email template first
        const bodyTemplate = await fs.promises.readFile(templatePath, 'utf-8');
        const bodyContent = ejs.render(bodyTemplate, { ...options }, { filename: templatePath });

        // Then render the base template with bodyContent
        const baseTemplate = await fs.promises.readFile(baseTemplatePath, 'utf-8');
        const htmlContent = ejs.render(
            baseTemplate,
            {
                subject: options.subject,
                email: options.email,
                body: bodyContent, // inject the rendered body into base template
            },
            { filename: baseTemplatePath }
        );

        // Nodemailer transporter
        const transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // secure only if port 465
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Verify transporter before sending
        await transporter.verify();

        const mailOptions = {
            from: `"TechHealthCare" <${process.env.SMTP_MAIL}>`,
            to: options.email,
            subject: options.subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        // console.log("Email sent successfully to:", options.email);

        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = sendEmail;