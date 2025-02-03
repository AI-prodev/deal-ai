export const calculateStartAndEndTime = (rounds: number): { startTime: string; endTime: string } => {
    // Get the current date
    const currentDate = new Date()

    // Calculate the end time by adding the number of rounds (days) to the current date
    const endTime = new Date(currentDate.getTime() + rounds * 24 * 60 * 60 * 1000)

    // Format the dates as strings in the desired format
    const formattedStartTime = currentDate.toISOString()
    const formattedEndTime = endTime.toISOString()

    return { startTime: formattedStartTime, endTime: formattedEndTime }
}
