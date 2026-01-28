"use client";

import { useState } from "react";
import { Webhook, Key, RefreshCw, Copy, Check, ExternalLink, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GeckoAuthoritySettings = {
  webhook_id: string;
  webhook_secret: string;
};

type GeckoAuthorityTabProps = {
  settings: GeckoAuthoritySettings;
  onChange: (settings: GeckoAuthoritySettings) => void;
  supabaseUrl: string;
};

export function GeckoAuthorityTab({ settings, onChange, supabaseUrl }: GeckoAuthorityTabProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCategories, setCopiedCategories] = useState(false);

  const fullWebhookUrl = settings.webhook_id
    ? `${supabaseUrl}/functions/v1/gecko-webhook/${settings.webhook_id}`
    : "";

  const categoriesUrl = `${supabaseUrl}/functions/v1/gecko-categories`;

  function generateSecret() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const secret = "whsec_" + Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
    onChange({ ...settings, webhook_secret: secret });
  }

  function generateUrlId() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const urlId = Array.from(array).map(b => b.toString(16).padStart(2, "0")).join("");
    onChange({ ...settings, webhook_id: urlId });
  }

  async function copyToClipboard(text: string, type: "url" | "secret" | "categories") {
    await navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCategories(true);
      setTimeout(() => setCopiedCategories(false), 2000);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Webhook className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Webhook URL</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Use this URL when adding your site to Gecko Authority
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhook-url" className="text-xs text-zinc-600 dark:text-zinc-400">
            Your Webhook Endpoint
          </Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              value={fullWebhookUrl}
              readOnly
              className="font-mono text-xs bg-zinc-50 dark:bg-zinc-800/50"
              placeholder="Click 'Generate' to create a webhook URL"
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => copyToClipboard(fullWebhookUrl, "url")}
              disabled={!fullWebhookUrl}
            >
              {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={generateUrlId}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          {!settings.webhook_id && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Click the refresh button to generate a unique webhook URL
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Key className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Webhook Secret</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              This secret is used to verify webhook requests from Gecko Authority
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="webhook-secret" className="text-xs text-zinc-600 dark:text-zinc-400">
            Secret Key
          </Label>
          <div className="flex gap-2">
            <Input
              id="webhook-secret"
              value={settings.webhook_secret}
              readOnly
              type="password"
              className="font-mono text-xs bg-zinc-50 dark:bg-zinc-800/50"
              placeholder="Click 'Generate' to create a secret"
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => copyToClipboard(settings.webhook_secret, "secret")}
              disabled={!settings.webhook_secret}
            >
              {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={generateSecret}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          {!settings.webhook_secret && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Click the refresh button to generate a webhook secret
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <FolderTree className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Categories URL</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Gecko Authority uses this URL to fetch your site categories
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categories-url" className="text-xs text-zinc-600 dark:text-zinc-400">
            Categories Endpoint
          </Label>
          <div className="flex gap-2">
            <Input
              id="categories-url"
              value={categoriesUrl}
              readOnly
              className="font-mono text-xs bg-zinc-50 dark:bg-zinc-800/50"
            />
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => copyToClipboard(categoriesUrl, "categories")}
            >
              {copiedCategories ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-sm text-sky-900 dark:text-sky-100 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          How to Connect
        </h3>
        <ol className="text-xs text-sky-800 dark:text-sky-200 space-y-2 list-decimal list-inside">
          <li>Generate both a Webhook URL and Secret above</li>
          <li>Save these settings by clicking &quot;Save Changes&quot;</li>
          <li>Go to Gecko Authority and add a new site</li>
          <li>Paste the Webhook URL, Secret, and Categories URL in the appropriate fields</li>
          <li>Gecko Authority will verify the connection automatically</li>
        </ol>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>Security Note:</strong> The webhook secret ensures that only Gecko Authority can send data to your site.
          If you regenerate the secret, you must also update it in Gecko Authority.
        </p>
      </div>
    </div>
  );
}
