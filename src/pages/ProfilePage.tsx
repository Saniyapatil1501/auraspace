import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme, themes } from "@/lib/theme-context";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/GlassCard";
import { Twemoji } from "@/components/Twemoji";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Mail, LogOut, Save, Lock, Bell, Moon, Sun } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: entryCount } = useQuery({
    queryKey: ["entry-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile updated ✨");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated ✨");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    }
    setChangingPassword(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-4xl font-semibold mb-2 glow-text tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-muted-foreground font-light mb-10">Manage your account</p>

        {isLoading ? (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 animate-pulse h-48" />
            <div className="glass rounded-2xl p-6 animate-pulse h-32" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <GlassCard glow className="gradient-border">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0 glow-border">
                  <Twemoji emoji="🌸" size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    {profile?.display_name || "Mindful User"}
                  </h2>
                  <p className="text-sm text-muted-foreground/60 font-light flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} />
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground/40 mt-1">
                    {entryCount ?? 0} journal entries
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-muted-foreground">
                  <User size={12} className="inline mr-1.5" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-muted/20 border border-border/20 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  placeholder="Your name"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving || !displayName.trim()}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-40 glow-border flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </GlassCard>

            {/* Settings */}
            <GlassCard className="gradient-border">
              <h3 className="font-display text-lg font-semibold text-foreground mb-5">Settings</h3>

              <div className="space-y-4">
                {/* Theme Picker */}
                <div className="py-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Moon size={16} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Theme</p>
                      <p className="text-xs text-muted-foreground/50">Choose your aesthetic</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {themes.map((t) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTheme(t.id)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          theme === t.id
                            ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                            : "bg-muted/20 text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        <Twemoji emoji={t.emoji} size={14} />
                        {t.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notifications Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Bell size={16} className="text-secondary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Notifications</p>
                      <p className="text-xs text-muted-foreground/50">Daily reminders</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                      notifications ? "bg-secondary/30" : "bg-muted/30"
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-foreground"
                      animate={{ x: notifications ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  </button>
                </div>

                {/* Change Password */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Lock size={16} />
                    Change Password
                  </button>

                  {showPasswordForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-3"
                    >
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password (min 6 characters)"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/20 border border-border/20 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 rounded-xl bg-muted/20 border border-border/20 text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                        className="w-full py-2.5 rounded-xl bg-primary/20 text-primary font-medium text-sm hover:bg-primary/30 transition-all disabled:opacity-40"
                      >
                        {changingPassword ? "Updating..." : "Update Password"}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Sign Out */}
            <GlassCard className="gradient-border">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={signOut}
                className="w-full py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium flex items-center justify-center gap-2 hover:bg-destructive/20 transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </motion.button>
            </GlassCard>

            <p className="text-center text-xs text-muted-foreground/40 tracking-wide">
              AuraSpace · Wellness experience · 2026
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
