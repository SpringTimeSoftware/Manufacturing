import type { QueryFilter } from "./contracts";

export function serializeFilters(filter: QueryFilter) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, String(entry));
      }

      continue;
    }

    params.set(key, String(value));
  }

  return params.toString();
}
