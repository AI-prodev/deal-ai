import bcrypt from "bcrypt"
import UserModel from "../models/user"
import { IUser } from "../types/IUser"

export const getUser = async (email: string): Promise<IUser> => {
    try {
        return await UserModel.findOne({ email }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const getUserById = async (_id: string): Promise<IUser> => {
    try {
        return await UserModel.findOne({ _id }).lean()
    } catch (error) {
        throw new Error(error)
    }
}

export const createUserWithTempPassword = async (
    user: Partial<IUser>
): Promise<IUser> => {
    const saltRounds = process.env.BCRYPT_SALT_ROUNDS || "10"

    const hashedPassword = await bcrypt.hash(
        user.password,
        parseInt(saltRounds, 10)
    )

    const newUser: IUser = new UserModel({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        roles: user.roles
    })

    try {
        return await newUser.save()
    } catch (error) {
        throw new Error(error)
    }
}
