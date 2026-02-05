"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Send, CheckCircle, Loader2, Twitter, Github, Linkedin, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

type SocialLinks = {
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
};

type ContactInfo = {
  contact_email: string;
  contact_address: string;
  social_links: SocialLinks;
};

export default function ContactPage() {
  const t = useTranslations("contact");
  const tValidation = useTranslations("validation");
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchContactInfo() {
      const { data } = await supabase
        .from("public_site_settings")
        .select("contact_email, contact_address, social_links")
        .maybeSingle();

      if (data) {
        setContactInfo({
          contact_email: data.contact_email || "",
          contact_address: data.contact_address || "",
          social_links: data.social_links || {},
        });
      }
      setLoading(false);
    }

    fetchContactInfo();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.status === 429) {
        setError(t("error_rate_limited"));
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      if (!res.ok && data.error === "validation_failed" && data.details) {
        const errors: Record<string, string> = {};
        data.details.forEach((err: { path: string[]; message: string }) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setFieldErrors(errors);
        setSubmitting(false);
        return;
      }

      if (!res.ok) throw new Error(data.error);

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(t("error_generic"));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const socialIcons = {
    twitter: Twitter,
    github: Github,
    linkedin: Linkedin,
    website: Globe,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12 mt-12">
          <h1 className="text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100 mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                {t("info_title")}
              </h2>

              {loading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-3/4" />
                </div>
              ) : (
                <div className="space-y-6">
                  {contactInfo?.contact_email && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          {t("email_label")}
                        </p>
                        <a
                          href={`mailto:${contactInfo.contact_email}`}
                          className="text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors"
                        >
                          {contactInfo.contact_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contactInfo?.contact_address && (
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          {t("address_label")}
                        </p>
                        <p className="text-zinc-900 dark:text-zinc-100 whitespace-pre-line">
                          {contactInfo.contact_address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {contactInfo?.social_links && Object.keys(contactInfo.social_links).length > 0 && (
                <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                    {t("follow_us")}
                  </p>
                  <div className="flex gap-3">
                    {Object.entries(contactInfo.social_links).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = socialIcons[platform as keyof typeof socialIcons];
                      if (!Icon) return null;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-primary hover:text-white transition-all"
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    {t("success_title")}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    {t("success_message")}
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    {t("send_another")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("form_name_label")}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("form_name_placeholder")}
                        className={`h-12 ${fieldErrors.name ? "border-red-500" : ""}`}
                      />
                      {fieldErrors.name && (
                        <p className="text-sm text-red-600 dark:text-red-400">{tValidation(fieldErrors.name)}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("form_email_label")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("form_email_placeholder")}
                        className={`h-12 ${fieldErrors.email ? "border-red-500" : ""}`}
                      />
                      {fieldErrors.email && (
                        <p className="text-sm text-red-600 dark:text-red-400">{tValidation(fieldErrors.email)}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("form_subject_label")}</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t("form_subject_placeholder")}
                      className={`h-12 ${fieldErrors.subject ? "border-red-500" : ""}`}
                    />
                    {fieldErrors.subject && (
                      <p className="text-sm text-red-600 dark:text-red-400">{tValidation(fieldErrors.subject)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("form_message_label")}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t("form_message_placeholder")}
                      className={`min-h-[160px] resize-none ${fieldErrors.message ? "border-red-500" : ""}`}
                    />
                    {fieldErrors.message && (
                      <p className="text-sm text-red-600 dark:text-red-400">{tValidation(fieldErrors.message)}</p>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full h-12" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {t("send_message")}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
