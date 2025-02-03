import express from "express"
export const shareRoutes = express.Router()


shareRoutes.get("/s/:funnelId", (req, res, next) => {
    res
        .status(200)
        .type("text/html")
        .send("This is a shared funnel URL. To import this funnel, go to your funnels page and click \"Import Funnel from URL\" and paste in this URL.")
})
