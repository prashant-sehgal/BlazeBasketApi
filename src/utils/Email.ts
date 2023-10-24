import * as nodemailer from 'nodemailer'
import AppError from './AppError'

export const sendEmail = async (to: string, subject: string, body: string) => {
    try {
        // create transporter
        const transporter = nodemailer.createTransport({
            host: `${process.env.EMAIL_HOST}`,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        })

        // mail options
        const mailOptions = {
            from: `BlazeBasket <${process.env.EMAIL_SENDER}>`,
            to,
            subject,
            html: body,
            text: body,
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        throw new AppError(
            'there is an issue in sending emails, Please try after sometime.',
            500
        )
    }
}
