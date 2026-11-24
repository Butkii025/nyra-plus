import { apiRequest } from "./api";

export function getAnalytics() {
  return apiRequest<Record<string, unknown>>("/analytics");
}
