// fyi: run this script with `npx ts-node src/libs/email/react/preview.ts`
// This script generates HTML preview files for each email template using example data.
// It saves the files in a "previews" directory, which is created if it doesn't exist.
// You can open the generated HTML files in a web browser to see how the emails will look.

import fs from "fs";
import path from "path";
import { renderTemplate } from "./renderer";
import type { TemplateInput } from "./types";
import { EmailTemplates } from ".";
import { EmailTemplateName } from "../../../../enum/Notification";

const examples: Record<any, TemplateInput> = {
  "donor-appeal": {
    title: "Urgent Blood Appeal",
    message: "We urgently need blood donations today. Your support can save lives.",
    bloodGroup: "O+",
  },
};

async function main() {
  const outputDir = "previews";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const [name, input] of Object.entries(examples)) {
    const templateName = name as EmailTemplateName;
    const Template = EmailTemplates[templateName];
    const html = renderTemplate(Template, input);
    const filename = path.join(outputDir, `preview-${templateName}.html`);

    fs.writeFileSync(filename, html, "utf8");
    console.log(
      `✅ ${templateName}: written to ${filename} | subject: ${name}`
    );
  }

  console.log("\nOpen the .html files in your browser to preview.");
}

main();
