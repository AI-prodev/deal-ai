export async function takeScreenshot(url: string): Promise<string> {
    const response = await fetch("https://api.urlbox.io/v1/render/sync", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.URLBOX_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url,
            "thumb_width": 300
        })
    })

    const data = await response.json()
    return data.renderUrl
}