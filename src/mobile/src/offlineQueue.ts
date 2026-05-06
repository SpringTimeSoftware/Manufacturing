import type { OfflineQueueEntry } from "./mobileTypes";

export function summarizeQueue(queue: OfflineQueueEntry[]) {
  return {
    pending: queue.filter((entry) => entry.status === "Pending" || entry.status === "Queued" || entry.status === "RetryScheduled").length,
    failed: queue.filter((entry) => entry.status === "Failed" || entry.status === "Conflict" || entry.status === "Rejected").length,
    synced: queue.filter((entry) => entry.status === "Synced").length
  };
}

export function canWorkOffline(queue: OfflineQueueEntry[]) {
  return queue.filter((entry) => entry.status === "Failed" || entry.status === "Conflict" || entry.status === "Rejected").length < 3;
}
