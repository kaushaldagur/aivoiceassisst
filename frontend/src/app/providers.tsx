import { AssistantProvider } from "../contexts/AssistantContext";
import { SettingsProvider } from "../contexts/SettingsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AssistantProvider>{children}</AssistantProvider>
    </SettingsProvider>
  );
}
