import { IUser } from "./IUser"

export interface IVideoCreation {
    userId: IUser["_id"];
    creationTimes: Date[];
}
