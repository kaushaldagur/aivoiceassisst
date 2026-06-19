import { apiRequest } from "./apiClient";
import type { PdfInfo } from "../types/pdf";

export function uploadPdf(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<{ pdf: PdfInfo }>("/pdf/upload", { method: "POST", body: formData });
}

export function getCurrentPdf() {
  return apiRequest<{ pdf: PdfInfo }>("/pdf/current");
}

export function clearCurrentPdf() {
  return apiRequest<{ message: string; pdf: PdfInfo }>("/pdf/current", { method: "DELETE" });
}

export function askPdf(question: string, language: string) {
  return apiRequest<{ answer: string; sourceReference: string }>("/pdf/ask", {
    method: "POST",
    body: JSON.stringify({ question, language })
  });
}
