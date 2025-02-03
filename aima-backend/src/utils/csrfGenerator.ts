export const generateCSRFToken = (): string => {
    // Length of the CSRF token (adjust as needed)
    const tokenLength = 32

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let csrfToken = ""

    for (let i = 0; i < tokenLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        csrfToken += characters.charAt(randomIndex)
    }

    return csrfToken
}
