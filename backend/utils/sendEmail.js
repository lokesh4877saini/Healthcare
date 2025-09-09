const nodeMailer = require('nodemailer');
const path = require('path');
const fs= require('fs');
const ejs = require('ejs');
const sendEmail = async(options) =>{
    const emailTemplatePath = path.join(__dirname,'../views/email_template.ejs');
    const emailTemplate = fs.readFileSync(emailTemplatePath,'utf-8');
    const htmlContent = ejs.render(emailTemplate,{
        name:options.name,
        message:options.message,
    });
    const transporter = nodeMailer.createTransport({
        service:process.env.SMPT_SERVICE,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD,
        },
    });
    const mailOptions = {
        from:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        html:htmlContent
    }
    await transporter.sendMail(mailOptions)
}
module.exports = sendEmail;