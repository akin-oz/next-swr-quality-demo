"use client";
import React, { useEffect, useRef } from "react";

export type AlertProps = {
  title?: string;
  children?: React.ReactNode;
  role?: "alert" | "status" | "log";
  severity?: "error" | "info" | "success" | "warning";
};

const severityStyles: Record<NonNullable<AlertProps["severity"]>, string> = {
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  success: "bg-green-50 text-green-800 border-green-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export function Alert({
  title,
  children,
  role = "alert",
  severity = "error",
}: Readonly<AlertProps>) {
  const elRef = useRef<HTMLDivElement>(null);

  const shouldFocus = role === "alert" && severity === "error";

  useEffect(() => {
    if (!shouldFocus) return;
    const el = elRef.current;
    Promise.resolve().then(() => el?.focus());
  }, [shouldFocus]);

  return (
    <div
      ref={elRef}
      className={`rounded-md border p-3 ${severityStyles[severity]}`}
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      tabIndex={shouldFocus ? -1 : undefined}
    >
      {title && <div className="font-semibold mb-1">{title}</div>}
      {children}
    </div>
  );
}

export default Alert;
