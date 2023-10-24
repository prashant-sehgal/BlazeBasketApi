import mongoose from 'mongoose'
import crypto from 'crypto'

export interface UserInterface {
    id: string
    name: string
    email: string
    password: string
    role: string
    image: string
    createdAt: Date
    passwordResetOTP: String
    passwordResetOTPExpiresIn: Date
    passwordChangedAt: Date

    isPasswordValid: Function
    createResetToken: Function
    resetPassword: Function
    verifyOtp: Function
    changePasswordAfter: Function
    updateMe: Function
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'user must have a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'user mush have an email address'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'user must have a password'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    image: {
        type: String,
        default: 'default.jpg',
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    passwordResetOTP: String,
    passwordResetOTPExpiresIn: Date,
    passwordChangedAt: Date,
})

const encrypt = function (message: string) {
    return crypto.createHash('sha256').update(message).digest('hex')
}

userSchema.pre('save', function (this, next) {
    if (!this.isModified('password')) return next()

    this.password = encrypt(this.password)
    this.passwordChangedAt = new Date(Date.now())

    next()
})

userSchema.methods.isPasswordValid = function (
    originalPassword: string,
    userPassword: string
) {
    const encryptedUserPassword = encrypt(userPassword)

    return originalPassword === encryptedUserPassword
}

userSchema.methods.createResetToken = async function (this) {
    let otp = Math.round(Math.random() * 1000000)
    while (otp.toString().length !== 6)
        otp = Math.round(Math.random() * 1000000)

    this.passwordResetOTP = encrypt(otp.toString())
    this.passwordResetOTPExpiresIn = new Date(Date.now() + 5 * 60 * 1000)

    await this.save({ validateBeforeSave: false })
    return otp
}

userSchema.methods.resetPassword = async function (
    this,
    newPassword: string,
    mode: string
) {
    this.password = newPassword

    if (mode === 'forgotpassword') {
        this.passwordResetOTP = undefined
        this.passwordResetOTPExpiresIn = undefined
    }

    await this.save()
}

userSchema.methods.verifyOtp = function (this, otp: string) {
    return encrypt(otp) === this.passwordResetOTP
}

userSchema.methods.changePasswordAfter = function (this, timeStamp: number) {
    return Math.floor(this.passwordChangedAt.getTime() / 1000) > timeStamp
}

userSchema.methods.updateMe = async function (
    this,
    name: string,
    image: string
) {
    this.name = name
    this.image = image
    await this.save()
}

const User = mongoose.model<UserInterface>('User', userSchema)
export default User
