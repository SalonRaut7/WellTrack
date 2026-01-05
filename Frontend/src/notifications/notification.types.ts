export interface AppNotification {
  id: string;
  date: string;
  message: string;
  type: "HydrationReminder" | "LowStepsWarning" | "sleep" | "food" | "habit" | "system";
}
