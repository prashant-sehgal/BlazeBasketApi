import { Request } from 'express'
import { UserInterface } from '../userModel'

export interface RequestInterface extends Request {
    user: UserInterface
    uid: string
}
