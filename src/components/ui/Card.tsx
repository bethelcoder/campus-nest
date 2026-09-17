import React, { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "bordered" | "interactive";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", variant = "default", padding = "md", ...props }, ref) => {
    const variantStyles = {
      default:
        "bg-white border border-slate-200/80 shadow-sm rounded-2xl dark:bg-slate-900 dark:border-slate-800",
      elevated:
        "bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl dark:bg-slate-900 dark:border-slate-800 dark:shadow-none",
      flat: "bg-slate-50 border border-transparent rounded-2xl dark:bg-slate-800/60",
      bordered:
        "bg-white border-2 border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-700",
      interactive:
        "bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer rounded-2xl dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-600",
    };

    const paddingStyles = {
      none: "p-0",
      sm: "p-3 sm:p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
      xl: "p-8 sm:p-10",
    };

    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
