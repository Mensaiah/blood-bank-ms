export type KYBStatusT = "approved" | "rejected" | "under review";

export type TemplateInput = {
  preheader?: string;
  title?: string;
  message?: string;
  bloodGroup?: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};
