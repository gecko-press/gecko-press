"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Status = "idle" | "loading" | "success" | "error";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [title, setTitle] = useState("Stay Updated");
  const [description, setDescription] = useState("Join our newsletter for the latest updates delivered straight to your inbox.");

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("theme_settings")
        .select("newsletter_title, newsletter_description")
        .eq("key", "global")
        .maybeSingle();

      if (data) {
        if (data.newsletter_title) setTitle(data.newsletter_title);
        if (data.newsletter_description) setDescription(data.newsletter_description);
      }
    }
    fetchSettings();
  }, []);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase().trim() });

      if (error) {
        if (error.code === "23505") {
          setErrorMessage("This email is already subscribed!");
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section className="relative overflow-hidden py-16 mt-8">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Send className="w-3.5 h-3.5" />
            Stay Updated
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
              <span className="font-medium">Thanks for subscribing! Check your inbox soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email"
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
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}
