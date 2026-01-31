/**
 * Activity logs feature interfaces.
 */

export type ActivityLogType = "success" | "error" | "warning" | "info";

export interface ActivityLog {
  id: number;
  timestamp: string;
  rover: string;
  roverId: string;
  action: string;
  type: ActivityLogType;
  details: string;
}

export interface ActivityLogsParams {
  page?: number;
  limit?: number;
  roverId?: string;
  type?: ActivityLogType;
}
