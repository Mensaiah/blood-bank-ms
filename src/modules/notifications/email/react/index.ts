

import { EmailTemplateName } from "../../../../enum/Notification";
import DonorAppeal from "./templates/DonorAppeal";




export * from "./types";
export { renderTemplate } from "./renderer";

export const EmailTemplates: Record<
  EmailTemplateName,
  (...args: any) => React.JSX.Element
> = {
  [EmailTemplateName.DonorAppeal]: DonorAppeal,

};
