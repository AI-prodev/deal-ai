import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";

export function transformMarkdownToArrayOfObjects(
  markdown: string
): ResponseItem[] {
  const lines = markdown.split(/\\n|\n/);
  const result = [];
  let section = 0;

  for (const line of lines) {
    if (line !== "") {
      const isTitle = line.includes("##");
      if (isTitle) section += 1;
      result.push({
        isTitle,
        text: isTitle
          ? line.replace(/"\s*#/g, "").replace(/^#+\s*/, "")
          : line.replace(/^\d+\.\s*/, "").replace(/["-]/g, ""),
        response: "",
        section,
        isSentToSeller: true,
        files: [],
        replies: [],
      });
    }
  }

  return result;
}

export function parseArrayOfItemsToMarkdown(data: ResponseItem[]) {
  let markdown = "";

  // Process each item in the array
  for (const { isTitle, text, isSentToSeller } of data) {
    if (isSentToSeller) {
      if (isTitle) {
        // Convert title to Markdown header (##)
        markdown += `\n\n## ${text}\n\n`;
      } else {
        // Convert non-title to Markdown unordered list
        markdown += ` - ${text}\n`;
      }
    }
  }

  return markdown;
}
