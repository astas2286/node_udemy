const nodemailer = require('nodemailer')
const pug = require('pug')
const { htmlToText } = require('html-to-text')

// IF YOU ARE USING GMAIL - Activate in gmail 'less secure app' option

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Stas Afanasiev <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return 1
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    // will send actual email
    async send(template, subject) {
        // 1) Render HTML based on the pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })

        //2) Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
        }
        // 3) create a transport & send email
        await this.newTransport().sendMail(mailOptions)

    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours family!')
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes')
    }
}

