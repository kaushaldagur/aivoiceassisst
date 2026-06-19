import { FileText, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useSettings } from "../contexts/SettingsContext";
import { askPdf, clearCurrentPdf, getCurrentPdf, uploadPdf } from "../services/pdfApi";
import type { PdfInfo } from "../types/pdf";

export function PdfChatPage() {
  const { settings } = useSettings();
  const [pdf, setPdf] = useState<PdfInfo | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentPdf().then((response) => setPdf(response.pdf)).catch(() => undefined);
  }, []);

  async function upload(file?: File) {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const response = await uploadPdf(file);
      setPdf(response.pdf);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function ask() {
    if (!question.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const response = await askPdf(question, settings.language);
      setAnswer(response.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not answer from PDF.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <FileText className="text-cyan-200" size={32} />
        <h2 className="mt-4 text-2xl font-semibold">PDF Chat</h2>
        <p className="mt-2 text-sm text-slate-400">Upload one PDF. A new upload replaces the previous document.</p>
        <label className="mt-6 flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-cyan-300/30 bg-cyan-400/10 p-8 text-center transition hover:border-cyan-200/50 hover:bg-cyan-400/15">
          <Upload />
          <span className="mt-3 text-sm">{loading ? "Extracting..." : "Choose PDF"}</span>
          <input className="hidden" type="file" accept="application/pdf" onChange={(event) => void upload(event.target.files?.[0])} />
        </label>
        {pdf?.hasPdf && (
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm">
            <p className="font-medium">{pdf.fileName}</p>
            <p className="text-slate-400">{pdf.characterCount.toLocaleString()} characters extracted</p>
            <Button className="mt-4 w-full" onClick={() => clearCurrentPdf().then((response) => setPdf(response.pdf))}>Remove PDF</Button>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </Card>
      <Card>
        <h3 className="text-xl font-semibold">Ask from document</h3>
        <div className="mt-4 flex gap-2">
          <Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What projects are mentioned?" />
          <Button disabled={loading || !pdf?.hasPdf} onClick={() => void ask()}>Ask</Button>
        </div>
        <div className="mt-6 min-h-64 rounded-lg border border-white/10 bg-slate-950/40 p-5">
          {loading ? <p className="text-slate-400">Generating answer from PDF...</p> : answer ? <p className="whitespace-pre-wrap leading-7">{answer}</p> : <p className="text-slate-400">Answers will be grounded only in the uploaded PDF.</p>}
          {answer && <p className="mt-5 text-xs uppercase tracking-[0.2em] text-cyan-200">Source: Current uploaded PDF</p>}
        </div>
      </Card>
    </div>
  );
}
