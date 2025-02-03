import { IProfile } from "../types/IProfile"
import { IUser } from "../types/IUser"
import ProfileModel from "../models/profile"

export const createProfileFromAutomation = async (user: IUser) => {
    const profileFields: Partial<IProfile> = {
        user: user._id,
        fields: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        }
    }

    const profile = new ProfileModel(profileFields)

    try {
        return await profile.save()
    } catch (error) {
        throw new Error(error)
    }
}
