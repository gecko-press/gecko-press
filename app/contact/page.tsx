"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Send, CheckCircle, Loader2, Twitter, Github, Linkedin, Globe } from "lucide-react";
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

  useEffect(() => {
    async function fetchContactInfo() {
      const { data } = await supabase
        .from("site_settings")
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
    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from("contact_submissions")
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Please try again.");
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
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Have a question or want to work together? We&apos;d love to hear from you.
            Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
                Contact Information
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
                          Email
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
                          Address
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
                    Follow Us
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
                    Message Sent!
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Your Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help you?"
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      required
                      className="min-h-[160px] resize-none"
                    />
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
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
