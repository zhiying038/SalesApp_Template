export const SHIP_DATE_FORMAT = "yyyy-MM-dd";
export const SHIP_DATE_DISPLAY_FORMAT = "EEE, dd MMM yyyy";

export const SHIP_DATE_PRESETS: ReadonlyArray<{ label: string; offsetDays: number }> = [
  { label: "Today", offsetDays: 0 },
  { label: "Tomorrow", offsetDays: 1 },
  { label: "+3d", offsetDays: 3 },
  { label: "+7d", offsetDays: 7 },
  { label: "+14d", offsetDays: 14 },
  { label: "+30d", offsetDays: 30 },
];

export type DocumentType = "Order" | "Quotation";

export type DocumentTypeOption = {
  value: DocumentType;
  label: string;
  icon: "receipt-outline" | "document-text-outline";
};

export const DOCUMENT_TYPE_OPTIONS: ReadonlyArray<DocumentTypeOption> = [
  { value: "Order", label: "Sales Order", icon: "receipt-outline" },
  { value: "Quotation", label: "Sales Quotation", icon: "document-text-outline" },
];
