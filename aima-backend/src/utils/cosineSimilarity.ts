export function dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors are not the same dimensions.")
    }

    let sum = 0
    for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i]
    }

    return sum
}

function magnitude(vector: number[]): number {
    let sum = 0
    for (let i = 0; i < vector.length; i++) {
        sum += vector[i] * vector[i]
    }

    return Math.sqrt(sum)
}

export function cosineSimilarity(a: number[], b: number[]): number {
    const cosineSim = dotProduct(a, b) / (magnitude(a) * magnitude(b))

    return cosineSim
}
