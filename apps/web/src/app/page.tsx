import { t } from "@ayahloop/i18n";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-background p-6 text-foreground">
      <h1 className="text-2xl font-semibold tracking-tight">{t("common.appName")}</h1>
      <p className="text-sm text-muted-foreground">{t("common.tagline")}</p>
    </main>
  );
}
