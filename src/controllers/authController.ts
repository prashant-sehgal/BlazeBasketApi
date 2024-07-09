import { Request, Response, NextFunction, RequestHandler } from 'express'
import CatchAsync from '../utils/CatchAsync'
import AppError from '../utils/AppError'
import User, { UserInterface } from '../models/userModel'
import jwt from 'jsonwebtoken'
import { sendEmail } from '../utils/Email'
import { readFile } from 'fs'
import { promisify } from 'util'
import { RequestInterface } from '../models/interfaces/RequestInterface'
import crypto from 'crypto'

function encrypt(data: string, key: string) {
    const iv = crypto.randomBytes(16)
    const keyBuffer = Buffer.from(key, 'hex')
    const aes256 = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv)
    let encrypted = aes256.update(data, 'utf-8', 'hex')
    encrypted += aes256.final('hex')

    return {
        iv: iv.toString('hex'),
        data: encrypted,
    }
}

function sendToken(user: UserInterface, response: Response) {
    const token = jwt.sign(
        { id: `${user.id}` },
        `${process.env.JWT_SECRET_KEY}`,
        {
            expiresIn: `${process.env.JWT_EXPIRES_IN}`,
        }
    )
    const decode: any = jwt.decode(token)

    const authString = `${token},${decode.exp * 1000}`
    const encryptedAuthString = encrypt(authString, `${process.env.ENC_KEY}`)

    return response
        .cookie('jwt', token)
        .status(200)
        .json({
            status: 'success',
            user: {
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            },
            authString: encryptedAuthString.data,
            random: encryptedAuthString.iv,
        })
}

export const signup = CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
        const newUser = await User.create({
            name: request.body.name,
            email: request.body.email,
            password: request.body.password,
        })
        sendToken(newUser, response)
    }
)

export const login = CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
        if (!request.body.email || !request.body.password)
            return next(new AppError('Please provide email and password', 400))

        const user = await User.findOne<UserInterface>({
            email: request.body.email,
        })

        if (!user)
            return next(new AppError('no user exists with that email', 400))

        if (!user.isPasswordValid(user.password, request.body.password))
            return next(new AppError('email or password is incorrect', 400))

        sendToken(user, response)
    }
)

export const forgotPassword = CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
        if (!request.body.email)
            return next(new AppError('please provide your email', 400))

        const user = await User.findOne<UserInterface>({
            email: request.body.email,
        })

        if (!user)
            return next(new AppError('no user exists with that email', 400))

        const otp = await user.createResetToken()

        const resetEmailTemplate = (
            await promisify(readFile)(
                `${__dirname}/../../views/html/resetEmailTemplate.html`,
                'utf-8'
            )
        ).replace('{{reset_otp}}', `${otp}`)

        sendEmail(user.email, 'Reset Your Password', resetEmailTemplate)

        return response.status(200).json({
            status: 'success',
            message:
                'password reset email has been sent to your email address.',
        })
    }
)

export const resetPassword = CatchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
        if (
            !request.body.email ||
            !request.body.otp ||
            !request.body.newPassword
        )
            return next(
                new AppError('please provide all neccessary information', 400)
            )

        const user = await User.findOne<UserInterface>({
            email: request.body.email,
        })

        if (!user)
            return next(new AppError('no user exists with that email', 400))

        if (!user.passwordResetOTPExpiresIn)
            return next(new AppError('OTP already expired', 400))

        if (!user.verifyOtp(request.body.otp))
            return next(new AppError('otp is incorrect', 400))

        user.resetPassword(request.body.newPassword, 'forgotpassword')

        return response.status(200).json({
            status: 'success',
            message: 'you password has been changed successfully',
        })
    }
)

export const authenticate = CatchAsync(async function (
    request: RequestInterface,
    response: Response,
    next: NextFunction
) {
    const jwtToken =
        request.cookies.jwt ||
        request.body.jwt ||
        request.body.appId ||
        request.headers['authorization']?.split(' ')[1]

    if (!jwtToken)
        return next(
            new AppError(
                'you are not logged in. Please login to get access',
                401
            )
        )

    if (jwtToken === process.env.APPLICATION_ID) {
        request.uid = 'application'
        next()
    } else {
        const decode: any = jwt.verify(
            jwtToken,
            `${process.env.JWT_SECRET_KEY}`
        )

        const user = await User.findById(decode.id)

        if (!user) return next(new AppError('user no longer exists', 401))

        if (user.changePasswordAfter(decode.iat)) {
            return next(
                new AppError(
                    'User recently changed password! Please log in again.',
                    401
                )
            )
        }

        // grant access
        request.user = user
        next()
    }
})

export function authorizedTo(...roles: string[]): any {
    return function (
        request: RequestInterface,
        response: Response,
        next: NextFunction
    ) {
        if (request.uid === 'application') {
            next()
        } else {
            if (!roles.includes(request.user.role))
                return next(
                    new AppError(
                        'you are not authorized to preform this action',
                        401
                    )
                )

            next()
        }
    }
}
