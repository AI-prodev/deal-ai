/**
 * Chooses between the primary and secondary OpenAI API keys based on the likelihood factor.
 * @returns {string} The selected API key.
 */
function chooseOpenAiKey(): string {
    const primaryApiKey = process.env.OPENAI_API_KEY
    const secondaryApiKey = process.env.OPENAI_API_KEY_SECONDARY
    const secondaryLikelihood = parseFloat(
        process.env.OPEN_AI_SECONDARY_LIKELIHOOD || "0"
    )

    const randomNumber = Math.random()

    return randomNumber < secondaryLikelihood ? secondaryApiKey : primaryApiKey
}

export { chooseOpenAiKey }
