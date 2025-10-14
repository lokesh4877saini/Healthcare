const nodeMailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const sendEmail = async (options) => {
    try {
        const templateName = options.template || 'email_template';
        const emailTemplatePath = path.join(__dirname, `../views/email/${templateName}.ejs`);

        if (!fs.existsSync(emailTemplatePath)) {
            console.error('Template file not found!');
            return false;
        }

        let htmlContent;

        const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');

        htmlContent = ejs.render(emailTemplate, {
            ...options,
            subject: options.subject,
            email: options.email
        }, {
            filename: emailTemplatePath, //find relative includes
            root: path.join(__dirname, '../views/email'), // Set root directory for includes
            views: [path.join(__dirname, '../views/email')] // Specify views directory
        });
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
            from: `"nextLevel HealthCare App" <${process.env.SMTP_MAIL}>`,
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