// importing environment variables
import { config } from 'dotenv'
config({ path: `${__dirname}/../.env` })

import mongoose from 'mongoose'
import app from './app'

// connect to database
mongoose
    .connect(`${process.env.mongodb}`)
    .then(() => console.log('db connected successfully ✔✔'))

// starting up the server
const server = app.listen(process.env.PORT, () => {
    console.log('application is running on port 5500')
})
