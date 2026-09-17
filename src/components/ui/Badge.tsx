import React from "react";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "navy"
  | "grade-a"
  | "grade-b"
  | "grade-c"
  | "grade-d"
  | "grade-e";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  icon,
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    default: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
      dotColor: "bg-slate-500",
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      dotColor: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-800 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      dotColor: "bg-amber-500",
    },
    danger: {
      bg: "bg-red-50 dark:bg-red-950/40",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-200 dark:border-red-800",
      dotColor: "bg-red-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      dotColor: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/40",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-800",
      dotColor: "bg-purple-500",
    },
    navy: {
      bg: "bg-navy-900 text-slate-100",
      text: "text-slate-100",
      border: "border-navy-700",
      dotColor: "bg-blue-400",
    },
    "grade-a": {
      bg: "bg-emerald-600 text-white shadow-sm",
      text: "text-white font-bold",
      border: "border-emerald-500",
      dotColor: "bg-emerald-200",
    },
    "grade-b": {
      bg: "bg-teal-600 text-white shadow-sm",
      text: "text-white font-bold",
      border: "border-teal-500",
      dotColor: "bg-teal-200",
    },
    "grade-c": {
      bg: "bg-amber-500 text-white shadow-sm",
      text: "text-white font-bold",
      border: "border-amber-400",
      dotColor: "bg-amber-100",
    },
    "grade-d": {
      bg: "bg-orange-600 text-white shadow-sm",
      text: "text-white font-bold",
      border: "border-orange-500",
      dotColor: "bg-orange-200",
    },
    "grade-e": {
      bg: "bg-red-600 text-white shadow-sm",
      text: "text-white font-bold",
      border: "border-red-500",
      dotColor: "bg-red-200",
    },
  };

  const sizeStyles: Record<string, string> = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-medium",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-semibold",
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${style.bg} ${style.text} ${style.border} ${
        sizeStyles[size] || sizeStyles.md
      } ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor} animate-pulse`} />}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
