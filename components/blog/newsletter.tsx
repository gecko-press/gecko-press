"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";

export function Newsletter() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("theme_settings")
        .select("newsletter_title, newsletter_description")
        .eq("key", "global")
        .maybeSingle();

      setTitle(data?.newsletter_title || t("default_title"));
      setDescription(data?.newsletter_description || t("default_description"));
    }
    fetchSettings();
  }, [t]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (res.status === 429) {
        setErrorMessage(t("error_rate_limited"));
        setStatus("error");
        return;
      }

      const data = await res.json();

      if (res.status === 409) {
        setErrorMessage(t("error_duplicate"));
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setErrorMessage(t("error_generic"));
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMessage(t("error_generic"));
      setStatus("error");
    }
  };

  return (
    <section className="relative overflow-hidden py-16 mt-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Send className="w-3.5 h-3.5" />
            {t("badge")}
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            {description}
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{t("success")}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 px-4 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary"
                  disabled={status === "loading"}
                />
                {status === "error" && errorMessage && (
                  <p className="text-sm text-red-500 mt-2 text-left">{errorMessage}</p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 px-6"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("subscribing")}
                  </>
                ) : (
                  <>
                    {t("subscribe")}
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            {t("privacy_note")}
          </p>
        </div>
      </div>
    </section>
  );
}
