import { IUser } from "./IUser"

export interface IImageCreation {
    userId: IUser["_id"];
    creationTimes: Date[];
}
