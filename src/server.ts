// importing environment variables
import { config } from 'dotenv'
config({ path: `${__dirname}/../.env` })

import mongoose from 'mongoose'
import app from './app'
import { sendEmail } from './utils/Email'

process.on('uncaughtException', async (error) => {
    await sendEmail(
        `${process.env.ADMIN_EMAIL}`,
        '🔴 Uncaught Exception in BlazeBasket api',
        `
        Error Name: ${error.name}<br>
        Error Message: ${error.message}<br>
        Error Stack: ${error.stack}<br>
        `
    )
    process.exit(1)
})

// connect to database
mongoose
    .connect(`${process.env.mongodb}`)
    .then(() => console.log('db connected successfully ✔✔'))

// starting up the server
const server = app.listen(process.env.PORT, () => {
    console.log('application is running on port 5500')
})

process.on('unhandledRejection', async function (error: any) {
    await sendEmail(
        `${process.env.ADMIN_EMAIL}`,
        '🟠 Uncaught Rejection in BlazeBasket api',
        `
        Error Name: ${error.name}<br>
        Error Message: ${error.message}<br>
        Error Stack: ${error.stack}<br>

        <h4>Server is shut down</h4>
        `
    )
    server.close(() => {
        process.exit(1)
    })
})
