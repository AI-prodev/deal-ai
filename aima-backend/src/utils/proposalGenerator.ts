/* eslint-disable quotes */
/* eslint-disable indent */
import { ProposalInput } from "../types/query"
import { RateLimitModel } from "../models/RateLimit"
import { moderate } from "./moderation"
import { chooseOpenAiKey } from "./chooseOpenAiKey"

function generateProposalIntro(input: ProposalInput): string {

		const prompt = `Write an introductory sentence to a marketing proposal for a business and its online presence. The business is called "${input.businessName}". Here is a description of the business:
\`\`\`
${input.businessDescription}
\`\`\`

Frame the intro sentence as "Marketing Suggestions" instead of a sales pitch. Touch on some actionable things they can improve right away (maybe mention a common thing that most businesses who have an online presence can improve). Write it from the perspective of pitching the company, i.e. say "your" instead of "their". ONLY WRITE ONE, SHORT SENTENCE:
`

		return prompt
}


function generateProposalSummary(input: ProposalInput): string {

		const prompt = `Write a conclusion for a marketing proposal for a business and its online presence. The business is called "${input.businessName}". Here is a description of the business:
\`\`\`
${input.businessDescription}
\`\`\`

Frame the conclusion as "Marketing Suggestions" instead of a sales pitch. Touch on some actionable things they can improve right away (maybe mention a common thing that most businesses who have an online presence can improve). Write it from the perspective of pitching the company, i.e. say "your" instead of "their". ONLY WRITE TWO, SHORT SENTENCES:
`

		return prompt
}

function generateProposalServices(input: ProposalInput): string {

		const prompt = `I want to create a list of services and the price for each service for a marketing proposal for a business and its online presence. The business is called "${input.businessName}". Here is a description of the business:
\`\`\`
${input.businessDescription}
\`\`\`

Include some actionable things that most businesses who have an online presence can improve can improve right away, such as improving ad imagery and copy, as well as some longer term objectives, such as SEO. Write it from the perspective of pitching the company, i.e. say "your" instead of "their".

Give me a list of at least 9 services, as well as TWO SENTENCES of additional comments, further clarifying your thinking.

The output should be a json object, with the most important changes first:
{
	"service1": {
		"service": "The service being offered, such as 'Post once per week to two social media platforms'",
		"price": "The price as a string. For example, something like '$1,999/mo' if it is recurring, or '$999 one time' if it is a one-time payment. These are just examples, but the ideal range for all prices should be between $499 and $3,999."
	},
	...
	"additionalComments": "Two sentences of additional comments, further explaining your choices and decision-making when determining the services and order of priority."
}
`

		return prompt
}

async function updateTokensUsed(userId: string, tokens: number) {
		const rateLimitData = await RateLimitModel.findOne({ userId: userId })

		if (!rateLimitData) {
				const newRateLimitData = new RateLimitModel({
						userId: userId,
						totalTokensUsed: tokens,
						lastTimeTotalTokensUsage: new Date()
				})
				await newRateLimitData.save()
		} else {
				rateLimitData.totalTokensUsed += tokens

				rateLimitData.lastTimeTotalTokensUsage = new Date()

				await rateLimitData.save()
		}
}

async function retryWithExponentialBackoff<T>(
		fn: () => Promise<T>,
		maxAttempts: number,
		delay: number,
		factor: number
): Promise<T> {
		let attempts = 0
		while (attempts < maxAttempts) {
				try {
						return await fn()
				} catch (error) {
						attempts++
						if (attempts >= maxAttempts) throw error
						await new Promise((resolve) => setTimeout(resolve, delay))
						delay *= factor
				}
		}
		throw new Error("All attempts failed")
}

export async function fetchChatCompletionProposalIntro(
		model: string,
		input: ProposalInput,
		userId: string,
		maxAttempts = 2,
		delay = 1000,
		factor = 2
): Promise<any> {
		const messages = [
				{
						role: "user",
						content: generateProposalIntro(input)
				}
		]
		console.log("input", input)
		console.log("messages", messages)
		const url = "https://api.openai.com/v1/chat/completions"
		const apiKey = chooseOpenAiKey()
		const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

		const payload = {
				model,
				messages,
				temperature: 1.0
		}

		await moderate(`${input.businessName} ${input.businessWebsite}`, userId)

		const fetchCompletion = async (): Promise<any> => {
				const response = (await Promise.race([
						fetch(url, {
								method: "POST",
								headers: {
										"Content-Type": "application/json",
										Authorization: `Bearer ${apiKey}`
								},
								body: JSON.stringify(payload)
						}),
						new Promise<Response>((_, reject) =>
								setTimeout(
										() => reject(new Error("Request timed out")),
										timeoutInMilliseconds
								)
						)
				])) as Response

				if (!response.ok) {
						throw new Error(`API request failed with status ${response.status}`)
				}

				const data = await response.json()

				if (!data.choices || !data.choices.length || !data.choices[0].message) {
						throw new Error("Unexpected response structure")
				}

				if (data.usage && data.usage.total_tokens) {
						await updateTokensUsed(userId, data.usage.total_tokens)
				}
				let content = data.choices[0].message.content
				if (content && content[0] == '"' && content[content.length - 1] == '"') {
						content = content.substring(1, content.length - 1)
				}

				return content
		}

		try {
				return await retryWithExponentialBackoff(
						fetchCompletion,
						maxAttempts,
						delay,
						factor
				)
		} catch (error) {
				console.error(`All ${maxAttempts} attempts failed:`, error)

				if (model !== "gpt-4") {
						console.log("Retrying with gpt-4 model.")
						return fetchChatCompletionProposalIntro("gpt-4", input, userId, 1)
				} else {
						return null
				}
		}
}


export async function fetchChatCompletionProposalSummary(
		model: string,
		input: ProposalInput,
		userId: string,
		maxAttempts = 2,
		delay = 1000,
		factor = 2
): Promise<any> {
		const messages = [
				{
						role: "user",
						content: generateProposalSummary(input)
				}
		]
		console.log("input", input)
		console.log("messages", messages)
		const url = "https://api.openai.com/v1/chat/completions"
		const apiKey = chooseOpenAiKey()
		const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

		const payload = {
				model,
				messages,
				temperature: 1.0
		}

		await moderate(`${input.businessName} ${input.businessWebsite}`, userId)

		const fetchCompletion = async (): Promise<any> => {
				const response = (await Promise.race([
						fetch(url, {
								method: "POST",
								headers: {
										"Content-Type": "application/json",
										Authorization: `Bearer ${apiKey}`
								},
								body: JSON.stringify(payload)
						}),
						new Promise<Response>((_, reject) =>
								setTimeout(
										() => reject(new Error("Request timed out")),
										timeoutInMilliseconds
								)
						)
				])) as Response

				if (!response.ok) {
						throw new Error(`API request failed with status ${response.status}`)
				}

				const data = await response.json()

				if (!data.choices || !data.choices.length || !data.choices[0].message) {
						throw new Error("Unexpected response structure")
				}

				if (data.usage && data.usage.total_tokens) {
						await updateTokensUsed(userId, data.usage.total_tokens)
				}
				let content = data.choices[0].message.content
				if (content && content[0] == '"' && content[content.length - 1] == '"') {
						content = content.substring(1, content.length - 1)
				}

				return content
		}

		try {
				return await retryWithExponentialBackoff(
						fetchCompletion,
						maxAttempts,
						delay,
						factor
				)
		} catch (error) {
				console.error(`All ${maxAttempts} attempts failed:`, error)

				if (model !== "gpt-4") {
						console.log("Retrying with gpt-4 model.")
						return fetchChatCompletionProposalSummary("gpt-4", input, userId, 1)
				} else {
						return null
				}
		}
}



export async function fetchChatCompletionProposalServices(
		model: string,
		input: ProposalInput,
		userId: string,
		maxAttempts = 2,
		delay = 1000,
		factor = 2
): Promise<any> {
		const messages = [
				{
						role: "user",
						content: generateProposalServices(input)
				}
		]
		console.log("input", input)
		console.log("messages", messages)
		const url = "https://api.openai.com/v1/chat/completions"
		const apiKey = chooseOpenAiKey()
		const timeoutInMilliseconds = 3 * 60 * 1000 // 3 minutes

		const payload = {
				model,
				messages,
				temperature: 1.0,
				response_format: { type: "json_object" }
		}

		await moderate(`${input.businessName} ${input.businessWebsite}`, userId)

		const fetchCompletion = async (): Promise<any> => {
				const response = (await Promise.race([
						fetch(url, {
								method: "POST",
								headers: {
										"Content-Type": "application/json",
										Authorization: `Bearer ${apiKey}`
								},
								body: JSON.stringify(payload)
						}),
						new Promise<Response>((_, reject) =>
								setTimeout(
										() => reject(new Error("Request timed out")),
										timeoutInMilliseconds
								)
						)
				])) as Response

				if (!response.ok) {
						throw new Error(`API request failed with status ${response.status}`)
				}

				const data = await response.json()

				if (!data.choices || !data.choices.length || !data.choices[0].message) {
						throw new Error("Unexpected response structure")
				}

				if (data.usage && data.usage.total_tokens) {
						await updateTokensUsed(userId, data.usage.total_tokens)
				}

				return JSON.parse(data.choices[0].message.content)
		}

		try {
				return await retryWithExponentialBackoff(
						fetchCompletion,
						maxAttempts,
						delay,
						factor
				)
		} catch (error) {
				console.error(`All ${maxAttempts} attempts failed:`, error)

				if (model !== "gpt-4") {
						console.log("Retrying with gpt-4 model.")
						return fetchChatCompletionProposalSummary("gpt-4", input, userId, 1)
				} else {
						return null
				}
		}
}
