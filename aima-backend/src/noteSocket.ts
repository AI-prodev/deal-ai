import { Server } from "socket.io"

export const noteSocket = {
    io: null as any,
    initSocketServer: function (expressServer: any) {
        if (this.io) {
            console.error(
                "Socket server already initialized, not doing anything"
            )
            return
        }

        this.io = new Server(expressServer, {
            cors: {
                origin: "*"
            }
        })

        this.io.on("connection", (socket: any) => {
            console.info("New client connected: " + socket.id)

            socket.on("disconnect", () => {
                console.info("Client disconnected: " + socket.id)
            })
        })
    },
    sendUpdateToCollab: function (json: string) {
        if (!this.io || !json) {
            console.error(
                "No socket server or json provided, not sending update"
            )
            return
        }

        this.io.emit("note_data_updated_by_owner", { json })
    },
    sendUpdateToOwner: function (json: string) {
        if (!this.io || !json) {
            console.error(
                "No socket server or json provided, not sending update"
            )
            return
        }

        this.io.emit("note_data_updated_by_collaborator", { json })
    }
}
