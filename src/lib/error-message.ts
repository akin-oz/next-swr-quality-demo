import { isAppError, type AppError } from "@/lib/models";

export type UserError = {
  title: string;
  description: string;
  severity: "error" | "warning" | "info" | "success";
};

const titleMap = (err: AppError): string => {
  if (err.type === "http") {
    if (err.status === 404) return "Not Found";
    if (err.status === 401) return "Unauthorized";
    if (err.status === 403) return "Forbidden";
    if (err.status && err.status >= 500) return "Server error";
    return "Failed to load";
  }

  if (err.type === "aborted") return "Canceled";
  if (err.type === "parse") return "Invalid response";
  if (err.type === "validation") return "Invalid data";
  if (err.type === "network") return "Failed to load";

  return "Something went wrong";
};

const descriptionMap = (err: AppError): string => {
  switch (err.type) {
    case "aborted":
      return "The request was canceled. You can try again.";
    case "network":
      return "We could not reach the server. Check your connection and try again.";
    case "parse":
      return "The server sent unreadable data. Please try again later.";
    case "validation":
      return "The server returned unexpected data.";
    case "http": {
      if (err.status === 404) return "The requested resource was not found.";
      if (err.status === 401) return "You must sign in to view this content.";
      if (err.status === 403)
        return "You do not have permission to perform this action.";
      if (err.status && err.status >= 500)
        return "The server encountered an error. Please try again later.";
      return err.message || "The request failed.";
    }
    default:
      return err.message || "Something went wrong. Please try again.";
  }
};

export function toUserError(err: unknown): UserError {
  if (!isAppError(err)) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Something went wrong. Please try again.";
    return {
      title: "Failed to load",
      description: message,
      severity: "error",
    };
  }

  const severity: UserError["severity"] =
    err.type === "validation" ? "warning" : "error";

  return {
    title: titleMap(err),
    description: descriptionMap(err),
    severity,
  };
}
