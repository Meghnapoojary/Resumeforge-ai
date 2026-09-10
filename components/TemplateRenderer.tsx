import EditorialTemplate from "./templates/EditorialTemplate";
import ModernTemplate from "./templates/ModernTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import HeaderBandTemplate from "./templates/HeaderBandTemplate";
import SidebarPhotoTemplate from "./templates/SidebarPhotoTemplate";
import SplitBoldTemplate from "./templates/SplitBoldTemplate";
import { TemplateProps } from "./templates/types";
import StandardTemplate from "./templates/StandardTemplates";
import React from "react";

export const TEMPLATES = [
  { id: "editorial", name: "Editorial", component: EditorialTemplate },
  { id: "modern", name: "Modern", component: ModernTemplate },
  { id: "minimal", name: "Minimal", component: MinimalTemplate },
  { id: "header-band", name: "Header Band", component: HeaderBandTemplate },
  { id: "sidebar-photo", name: "Sidebar Photo", component: SidebarPhotoTemplate },
  { id: "split-bold", name: "Split Bold", component: SplitBoldTemplate },
  { id: "elegant", name: "Elegant", component: (props: TemplateProps) => <StandardTemplate {...props} variant="elegant" /> },
  { id: "chronological", name: "Chronological", component: (props: TemplateProps) => <StandardTemplate {...props} variant="chronological" /> },
  { id: "ats-classic", name: "ATS Classic", component: (props: TemplateProps) => <StandardTemplate {...props} variant="ats-classic" /> },
  { id: "executive", name: "Executive", component: (props: TemplateProps) => <StandardTemplate {...props} variant="executive" /> },
  { id: "academic", name: "Academic", component: (props: TemplateProps) => <StandardTemplate {...props} variant="academic" /> },
  { id: "clean", name: "Clean", component: (props: TemplateProps) => <StandardTemplate {...props} variant="clean" /> },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export default function TemplateRenderer({ templateId, ...props }: TemplateProps & { templateId?: string }) {
  const found = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  const Component = found.component;
  return <Component {...props} />;
}
