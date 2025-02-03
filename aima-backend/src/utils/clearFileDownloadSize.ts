import UserModel from "../models/user"

export const clearFileDownloadSize = async () => {
    const usersWithExcessDownloadSize = await UserModel.find({
        fileDownloadSize: { $gt: 0 }
    }).exec()

    for (const user of usersWithExcessDownloadSize) {
        console.log(
            `Resetting user file download size for ${user.email} (size: ${user.fileDownloadSize})`
        )

        user.fileDownloadSize = 0
        user.save()
    }
}
