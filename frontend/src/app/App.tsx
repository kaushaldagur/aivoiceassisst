import { Route, Routes } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ChatPage } from "../pages/ChatPage";
import { HistoryPage } from "../pages/HistoryPage";
import { HomePage } from "../pages/HomePage";
import { InterviewPage } from "../pages/InterviewPage";
import { PdfChatPage } from "../pages/PdfChatPage";
import { SettingsPage } from "../pages/SettingsPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/pdf" element={<PdfChatPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
