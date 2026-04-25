import { motion } from "framer-motion";
import {
  Save,
  FolderOpen,
  Copy,
  Download,
  Trash,
  GitCompare,
  History as HistoryIcon,
} from "lucide-react";

interface ActionBarProps {
  onSave: () => void;
  onLoad: () => void;
  onCopy: () => void;
  onExport: () => void;
  onClear: () => void;
  onCompare: () => void;
  onHistory: () => void;
}

export function ActionBar({
  onSave,
  onLoad,
  onCopy,
  onExport,
  onClear,
  onCompare,
  onHistory,
}: ActionBarProps) {
  const left = [
    { label: "Save Template", icon: Save, onClick: onSave, primary: true },
    { label: "Load", icon: FolderOpen, onClick: onLoad },
    { label: "History", icon: HistoryIcon, onClick: onHistory },
  ];
  const right = [
    { label: "Compare", icon: GitCompare, onClick: onCompare, accent: true },
    { label: "Copy", icon: Copy, onClick: onCopy },
    { label: "Export .txt", icon: Download, onClick: onExport },
    { label: "Clear", icon: Trash, onClick: onClear, danger: true },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl glass-strong p-2">
      <div className="flex flex-wrap items-center gap-2">
        {left.map((b) => (
          <ActionButton key={b.label} {...b} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {right.map((b) => (
          <ActionButton key={b.label} {...b} />
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  primary,
  accent,
  danger,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  primary?: boolean;
  accent?: boolean;
  danger?: boolean;
}) {
  const base =
    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all";
  const styleClass = primary
    ? "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-[0_0_36px_hsl(var(--primary)/0.55)]"
    : accent
    ? "border border-primary/40 bg-primary/10 text-primary-glow hover:bg-primary/15"
    : danger
    ? "border border-border/60 bg-background/40 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
    : "border border-border/60 bg-background/40 text-foreground hover:border-primary/40 hover:bg-background";

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${base} ${styleClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </motion.button>
  );
}
