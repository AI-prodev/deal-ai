import { handleSubmitEmailForm } from "@/components/puckeditor/blocks/Forms/EmailForm/script";
import { getMenuItems } from "@/components/puckeditor/blocks/Menu/script";

export default function generate({
  rowhtml,
  css,
  menuProps,
}: {
  rowhtml: string;
  css: string;
  menuProps: {
    textColor: string;
  };
}) {
  const extractedHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
        <style>${css}</style>
      </head>
      <body>
        ${rowhtml}
      <script>
        ${handleSubmitEmailForm}
        ${getMenuItems(menuProps?.textColor)}
      </script>
      </body>
    </html>
  `;

  return extractedHTML;
}
