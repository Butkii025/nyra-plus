import { apiRequest } from "./api";

export interface Trend {
  id: string;
  name: string;
}

export function getTrends() {
  return apiRequest<Trend[]>("/trends");
}
