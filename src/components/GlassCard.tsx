import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

export const GlassCard = ({ children, glow = false, className = "", ...props }: GlassCardProps) => (
  <motion.div
    className={`glass rounded-2xl p-6 ${glow ? "glow-border" : ""} ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);
