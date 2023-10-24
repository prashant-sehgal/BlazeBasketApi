import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import productRouter from './routes/productRoutes'
import authRouter from './routes/authRoutes'
import GlobalErrorHandler from './utils/GlobalErrorHandler'

const app = express()

// implement cors
app.use(cors())
app.options('*', cors())

// parse cookies
app.use(cookieParser())

// serve static files
app.use('/public', express.static(`${__dirname}/../public`))

// import request json data to request.body
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// log request data in developement mode
if (process.env.NODE_ENV?.trim() === 'development') app.use(morgan('dev'))
// Routes Middleware
app.use('/api/v1/products', productRouter)
app.use('/api/v1/users', authRouter)

app.use(GlobalErrorHandler)
export default app
