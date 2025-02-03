export const randomString = (n: number) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    const charactersLength = characters.length

    for (let i = 0; i < n; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
}