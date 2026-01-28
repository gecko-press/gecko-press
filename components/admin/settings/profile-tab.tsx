"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileSettings = {
  author_name: string;
  author_bio: string;
};

type ProfileTabProps = {
  settings: ProfileSettings;
  onChange: (settings: ProfileSettings) => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
};

export function ProfileTab({ settings, onChange, onPasswordChange }: ProfileTabProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  async function handlePasswordChange() {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await onPasswordChange(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Author Name</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              This name will be displayed on your blog posts
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="author-name" className="text-xs text-zinc-600 dark:text-zinc-400">
            Display Name
          </Label>
          <Input
            id="author-name"
            value={settings.author_name}
            onChange={(e) => onChange({ ...settings, author_name: e.target.value })}
            placeholder="John Doe"
            className="bg-zinc-50 dark:bg-zinc-800/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="author-bio" className="text-xs text-zinc-600 dark:text-zinc-400">
            About Author
          </Label>
          <Textarea
            id="author-bio"
            value={settings.author_bio || ""}
            onChange={(e) => onChange({ ...settings, author_bio: e.target.value })}
            placeholder="Write a short bio about yourself..."
            className="bg-zinc-50 dark:bg-zinc-800/50 min-h-[100px] resize-none"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This will be displayed at the bottom of your blog posts
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">Change Password</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Update your account password
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-xs text-zinc-600 dark:text-zinc-400">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs text-zinc-600 dark:text-zinc-400">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs text-zinc-600 dark:text-zinc-400">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {passwordError && (
            <p className="text-xs text-red-600 dark:text-red-400">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-xs text-green-600 dark:text-green-400">Password changed successfully</p>
          )}

          <Button
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword || !confirmPassword || changingPassword}
            className="w-full sm:w-auto"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
