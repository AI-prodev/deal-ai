import React from "react";

interface HookItem {
  h?: string;
  b?: string;
  r?: string;
  q?: string;
  a?: string;
  url?: string;
}

interface CommerceItem {
  id: string;
  magicHook: { content: Array<{ id: string; content: string }> };
  seoTags: { content: Array<{ id: string; tag: string }> };
  productDescription: { content: Array<{ id: string; product: string }> };
  benefitStack: { content: Array<{ id: string; content: string }> };
  faq: { content: Array<{ id: string; q: string; a: string }> };
}

interface EmailSequenceItem {
  subject: string;
  body: string;
  url?: string;
}

interface SeoOptimizedIntroItem {
  content: Array<{ id: string; h: string }>;
  seoTags: { content: Array<{ id: string; tag: string }> };
  magicHook?: { content: Array<{ id: string; h: string }> };

  productDescription?: { content: Array<{ id: string; product: string }> };
  benefitStack?: { content: Array<{ id: string; content: string }> };
  faq?: { content: Array<{ id: string; q: string; a: string }> };
}

type Item =
  | HookItem[]
  | CommerceItem[]
  | EmailSequenceItem[]
  | SeoOptimizedIntroItem[];

const DownloadAIApps: React.FC = () => {
  const downloadContent = (): void => {
    const aiAppsData: Record<string, string | null> = {
      magicHooks: localStorage.getItem("hooksRequestTokenGenerations"),
      benefit: localStorage.getItem("benefitRequestTokenGenerations"),
      bonus: localStorage.getItem("bonusRequestTokenGenerations"),
      faq: localStorage.getItem("faqRequestTokenGenerations"),
      hero: localStorage.getItem("heroRequestTokenGenerations"),
      adSocial: localStorage.getItem("adSocialRequestTokenGenerations"),
      commerce: localStorage.getItem("commerceHooksData"),
      emailSequence: localStorage.getItem(
        "emailSequencehooksRequestTokenGenerations"
      ),
      "seo-optimized-intros": localStorage.getItem("businessDescHookData"),
    };

    let fileContent: string = "";

    Object.entries(aiAppsData).forEach(([app, data], index) => {
      if (data) {
        fileContent += `${app
          .replace(/-/g, " ")
          .trim()
          .replace(/\b\w/g, l => l.toUpperCase())} \n`;

        fileContent += "\n";
        const items: any[] = JSON.parse(data);

        items.forEach((item, itemIndex) => {
          fileContent += `Generation #${itemIndex + 1}\n`;
          fileContent += "\n";
          if ("hooks" in item && item.hooks && app !== "emailSequence") {
            item.hooks.forEach((hook: HookItem) => {
              fileContent += hook.h ? `${hook.h}\n` : "";
              fileContent += hook.b && hook.r ? `${hook.b} - ${hook.r}\n` : "";
              fileContent +=
                hook.a && !hook.q && app === "benefit" ? `${hook.a}\n` : "";
              fileContent +=
                hook.q && hook.a && app === "faq"
                  ? `Q: ${hook.q}\nA: ${hook.a}\n`
                  : "";
              fileContent += hook.url ? `${hook.url}\n` : "";
            });
          } else if (app === "commerce") {
            const commerceItem = item as CommerceItem;
            // commerceItem.magicHook.content.forEach((contentItem, genIndex) => {
            //   fileContent += `Magic Hook : ${
            //     contentItem.content
            //   }\n`;
            // });
            fileContent += `Magic Hook: ${
              commerceItem.magicHook.content[0]?.id
                ? commerceItem.magicHook.content[0].content
                : commerceItem.magicHook.content[0]
            }\n`;
            fileContent += commerceItem.productDescription.content[0]?.id
              ? commerceItem.productDescription.content
                  .map((item: any) => item.content)
                  .join("\n")
              : commerceItem.productDescription.content
                  .map((item: any) => item)
                  .join("\n");
            fileContent += commerceItem.benefitStack.content[0]?.id
              ? commerceItem.benefitStack.content
                  .map((item: any) => `- ${item.content}`)
                  .join("\n")
              : commerceItem.benefitStack.content
                  .map((item: any) => `- ${item}`)
                  .join("\n");
            fileContent += "\n";

            if (commerceItem?.seoTags?.content) {
              const seoTags = commerceItem.seoTags.content;
              seoTags.forEach((tagItem: any) => {
                fileContent += `SEO Tag : ${
                  tagItem.id ? tagItem.tag : tagItem
                }\n`;
              });
            }
            commerceItem.faq.content.forEach((faqItem, genIndex) => {
              fileContent += `Q: ${faqItem.q}\nA: ${faqItem.a}\n`;
            });
          } else if (app.trim() === "emailSequence") {
            item.hooks.forEach((hook: any, hookIndex: number) => {
              if (hook.output.timing) {
                fileContent += `Timing: ${hook.output.timing}\n`;
              }
              fileContent += `Subject: ${hook.output.subject}\n`;
              fileContent += `Body:\n${hook.output.body
                .replace(/<br\s*\/?>/g, "\n")
                .replace(/<\/?p>/g, "")}\n\n`;
              if (hook.output.url) {
                fileContent += `URL: ${hook.output.url}\n`;
              }
            });
          } else if (app === "seo-optimized-intros") {
            const seoItem = item as SeoOptimizedIntroItem;
            seoItem?.content?.forEach((contentItem, genIndex) => {
              fileContent += `SEO Optimized Intro : ${contentItem.h}\n`;
            });

            if (seoItem?.seoTags?.content) {
              const seoTags = seoItem.seoTags.content;
              seoTags.forEach((tagItem: any) => {
                fileContent += `SEO Tag : ${
                  tagItem.id ? tagItem.tag : tagItem
                }\n`;
              });
            }
            fileContent += `Magic Hook: ${
              seoItem?.magicHook?.content[0]?.id
                ? seoItem?.magicHook?.content[0].h
                : seoItem?.magicHook?.content[0]
            }\n`;
            fileContent += seoItem?.productDescription?.content[0]?.id
              ? seoItem?.productDescription?.content
                  .map((item: any) => item.product)
                  .join("\n")
              : seoItem?.productDescription?.content.join("\n");
            fileContent += seoItem?.benefitStack?.content[0]?.id
              ? seoItem?.benefitStack?.content
                  .map((item: any) => `- ${item.content}`)
                  .join("\n")
              : seoItem?.benefitStack?.content
                  .map((item: any) => `- ${item}`)
                  .join("\n");
            seoItem?.faq?.content.forEach((faqItem, genIndex) => {
              fileContent += `FAQ : Q: ${faqItem.q} A: ${faqItem.a}\n`;
            });
          }
          fileContent += "\n";
        });

        if (index < Object.entries(aiAppsData).length - 1) {
          fileContent += "\n";
          fileContent += "\n";
        }
      }
    });

    const blob: Blob = new Blob([fileContent], { type: "text/plain" });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement("a");
    a.href = url;
    a.download = "AI_Apps_Content.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-5 flex w-full flex-wrap justify-center rounded-full">
      <div className="rounded-md border border-gray-500/20 bg-blue-800 p-6 shadow-[rgb(31_45_61_/_10%)_0px_2px_10px_1px] dark:shadow-[0_2px_11px_0_rgb(6_8_24_/_39%)]">
        <div className="flex flex-col items-center justify-center md:flex-row">
          <p className=" text-[16px]  text-white">
            We will soon be enabling Projects for AI Apps! With this update, you
            will be able to switch between multiple projects and clients without
            resetting, and work over different browsers and devices. As part of
            this we will move across the content you’ve created but we{" "}
            <span className="font-bold underline">strongly recommend</span> you
            download everything you’ve created using the Download button.
          </p>
          <button
            type="button"
            className=" mx-2 my-2 w-full rounded-xl bg-white p-3 font-semibold text-dark hover:underline md:my-0 md:w-1/3"
            onClick={downloadContent}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadAIApps;
