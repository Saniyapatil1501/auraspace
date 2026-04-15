import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, LogOut, Sparkles, UserCircle, Wind } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/mood", label: "Mood", icon: Sparkles },
  { path: "/dashboard", label: "Journal", icon: LayoutDashboard },
  { path: "/calm", label: "Calm", icon: Wind },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // ✅ FETCH PROFILE NAME
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (!user) return null;

  const displayName = profile?.display_name?.split(" ")[0] || "User";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight">
          <span className="gradient-text">AuraSpace</span>
        </Link>

        {/* NAV */}
        <div className="flex items-center gap-2">

          {/* USER NAME */}
          <span className="hidden sm:block text-sm text-muted-foreground mr-2">
            Hi, {displayName} ✨
          </span>

          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.nav>
  );
};