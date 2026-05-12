interface LinkedRecordSource {
  actionDisabledReason?: string;
  actionLabel?: string;
  actionPath?: string;
}

export interface LinkedRecordActionState {
  disabled: boolean;
  hidden: boolean;
  label: string;
  path?: string;
  reason?: string;
}

function hasRecordContext(path: string) {
  try {
    const url = new URL(path, "https://sts.local");

    if ([...url.searchParams.values()].some((value) => value.trim().length > 0)) {
      return true;
    }

    return /\/(detail|records|workspaces)\//i.test(url.pathname);
  } catch {
    return false;
  }
}

export function getLinkedRecordActionState(
  source: LinkedRecordSource,
  fallbackLabel = "Open linked record"
): LinkedRecordActionState {
  const label = source.actionLabel ?? fallbackLabel;
  const path = source.actionPath?.trim();

  if (source.actionDisabledReason) {
    return {
      disabled: true,
      hidden: false,
      label,
      reason: source.actionDisabledReason
    };
  }

  if (!path) {
    return {
      disabled: false,
      hidden: true,
      label
    };
  }

  if (!hasRecordContext(path)) {
    return {
      disabled: true,
      hidden: false,
      label,
      reason: "This action needs record-specific context before it can open a workspace."
    };
  }

  return {
    disabled: false,
    hidden: false,
    label,
    path
  };
}
