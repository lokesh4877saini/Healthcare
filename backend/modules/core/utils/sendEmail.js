const nodeMailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const sendEmail = async (options) => {
    try {
        // Paths
        const baseTemplatePath = path.join(__dirname, '../views/email/base.ejs'); // Your base template
        const templatePath = path.join(__dirname, `../views/email/${options.template}.ejs`);

        if (!fs.existsSync(templatePath) || !fs.existsSync(baseTemplatePath)) {
            console.error('Template file not found!');
            return false;
        }

        // Read and render the specific email template first
        const bodyTemplate = fs.readFileSync(templatePath, 'utf-8');
        const bodyContent = ejs.render(bodyTemplate, {
            ...options,
        }, {
            filename: templatePath
        });

        // Then render the base template with bodyContent
        const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf-8');
        const htmlContent = ejs.render(baseTemplate, {
            subject: options.subject,
            email: options.email,
            body: bodyContent // inject the rendered body into base template
        }, {
            filename: baseTemplatePath
        });

        // Nodemailer transporter
        const transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_MAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"TechHealthCare" <${process.env.SMTP_MAIL}>`,
            to: options.email,
            subject: options.subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        return true;

    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;