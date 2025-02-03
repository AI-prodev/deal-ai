import { Namespace, Server } from "socket.io"
import { Server as HttpServer } from "http"
import assistService from "./assist.service"
import {
    deleteRedis,
    getAllRedis,
    redisClient,
    setRedis
} from "./redis.service"
import { isValidObjectId } from "mongoose"
import { CorsOptions, CorsOptionsDelegate } from "cors"
import { createAdapter } from "@socket.io/redis-adapter"

// This socket is working on Notes & Assist

type ChatData = { chatId: string; sender: string; data?: any }

const uuidv4 =
    /^\/[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

const corsConfig: CorsOptions | CorsOptionsDelegate = {
    origin: process.env.FRONT_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true
}

const pubClient = redisClient
const subClient = pubClient.duplicate()

export default class SocketServer {
    private io: Server
    private namespace: Namespace

    constructor(server: HttpServer) {
        this.io = new Server(server, {
            cors: corsConfig,
            path: "/socket-io",
            adapter: createAdapter(pubClient, subClient)
        })
        this.namespace = this.io.of(uuidv4)
        this.handleConnection()
    }

    private handleConnection(): void {
        this.io.on("connection", (socket) => {
            console.info("New client connected: " + socket.id)

            socket.on("disconnect", () => {
                console.info("Client disconnected: " + socket.id)
            })
        })
        this.namespace.on("connection", (socket) => {
            const widgetId = socket.nsp.name.substring(1)
            const userId = socket.handshake.query.userId

            console.info(
                "New client connected on nsp: " + widgetId + " id: " + socket.id
            )

            if (isValidObjectId(userId)) {
                setRedis(`online_users:${widgetId}:${userId}`, "true").then(
                    () => {
                        this.namespace.emit("onlineUserReceived", {
                            sender: userId,
                            widgetId
                        })
                    }
                )
            } else {
                setRedis(`online_visitors:${widgetId}:${userId}`, "true").then(
                    () => {
                        this.namespace.emit("onlineVisitorReceived", {
                            sender: userId,
                            widgetId
                        })
                    }
                )
            }

            socket.on(
                "getOnlineUsers",
                this.getOnlineUsers.bind(this, widgetId)
            )

            socket.on(
                "getOnlineVisitors",
                this.getOnlineVisitors.bind(this, widgetId)
            )

            socket.on("sendMessage", this.sendMessage.bind(this))

            socket.on("sendMessageInChat", this.sendMessageInChat.bind(this))

            socket.on("sendChangeStatus", this.sendChangeStatus.bind(this))

            socket.on("sendSeenInChat", this.sendSeenInChat.bind(this))

            socket.on("typing", this.sendTyping.bind(this))

            socket.on("typingInChat", this.sendTypingInChat.bind(this))

            socket.on("stopTyping", this.sendStopTyping.bind(this))

            socket.on("stopTypingInChat", this.sendStopTypingInChat.bind(this))

            socket.on("newTicket", this.newTicket.bind(this))

            socket.on("updateVisitorData", this.updateVisitorData.bind(this))

            socket.on("disconnect", () => {
                console.info(
                    "Client disconnected from nsp: " +
                        widgetId +
                        " id: " +
                        socket.id
                )

                if (isValidObjectId(userId)) {
                    deleteRedis(`online_users:${widgetId}:${userId}`).then(
                        () => {
                            this.namespace.emit("offlineUserReceived", {
                                sender: userId,
                                widgetId
                            })
                        }
                    )
                } else {
                    deleteRedis(`online_visitors:${widgetId}:${userId}`).then(
                        () => {
                            this.namespace.emit("offlineVisitorReceived", {
                                sender: userId,
                                widgetId
                            })
                        }
                    )
                }
            })
        })
    }

    // Note
    public sendUpdateToCollab(json: string) {
        if (!json) {
            console.error("No json provided, not sending update")
            return
        }
        this.io.emit("note_data_updated_by_owner", { json })
    }
    public sendUpdateToOwner(json: string) {
        if (!json) {
            console.error("No json provided, not sending update")
            return
        }
        this.io.emit("note_data_updated_by_collaborator", { json })
    }
    // Assist
    private async getOnlineUsers(widgetId: string) {
        const keys = await getAllRedis(`online_users:${widgetId}:*`)
        const userIds = keys?.map((key) => key.split(":")[2])
        this.namespace.emit("onlineUsers", { data: userIds, widgetId })
    }

    private async getOnlineVisitors(widgetId: string) {
        const keys = await getAllRedis(`online_visitors:${widgetId}:*`)
        const userIds = keys?.map((key) => key.split(":")[2])
        this.namespace.emit("onlineVisitors", { data: userIds, widgetId })
    }

    private sendMessage({ chatId, sender }: ChatData): void {
        this.namespace.emit("messageReceived", { chatId, sender })
    }

    private sendMessageInChat({ chatId, sender }: ChatData): void {
        this.namespace.emit("messageReceivedInChat", { chatId, sender })
    }

    private sendChangeStatus({ chatId, sender }: ChatData): void {
        this.namespace.emit("changeStatusReceived", { chatId, sender })
    }

    private sendTyping({ chatId, sender }: ChatData): void {
        this.namespace.emit("typingReceived", { chatId, sender })
    }

    private sendStopTyping({ chatId, sender }: ChatData): void {
        this.namespace.emit("stopTypingReceived", { chatId, sender })
    }

    private sendSeenInChat({ chatId, sender }: ChatData): void {
        this.namespace.emit("seenReceivedInChat", { chatId, sender })
    }

    private sendTypingInChat({ chatId, sender }: ChatData): void {
        this.namespace.emit("typingReceivedInChat", { chatId, sender })
    }

    private sendStopTypingInChat({ chatId, sender }: ChatData): void {
        this.namespace.emit("stopTypingReceivedInChat", { chatId, sender })
    }

    private newTicket({ chatId }: ChatData): void {
        setTimeout(async () => {
            await assistService.createMessage(
                chatId,
                "chatbot",
                "You will be notified here and by email",
                true
            )
            this.namespace.emit("messageReceivedFromBot", { chatId })
        }, 1000)
        this.namespace.emit("newTicketReceived", { chatId })
    }

    private updateVisitorData({ chatId, data }: ChatData): void {
        this.namespace.emit("updateVisitorDataReceived", { chatId, data })
        this.namespace.emit("updateVisitorDataReceivedInChat", { chatId, data })
    }
}
