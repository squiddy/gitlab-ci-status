import React from "react";

import { ReactComponent as Failed } from "./images/failed.svg";
import { ReactComponent as Success } from "./images/success.svg";
import { ReactComponent as Skipped } from "./images/skipped.svg";
import { ReactComponent as Running } from "./images/running.svg";
import { ReactComponent as Created } from "./images/created.svg";
import { ReactComponent as Pending } from "./images/pending.svg";

export function StatusIcon({ status, ...rest }) {
  // Renders a visual icon for the build/pipeline status.
  const Component = {
    failed: Failed,
    success: Success,
    skipped: Skipped,
    canceled: Skipped,
    running: Running,
    created: Created,
    pending: Pending,
    manual: Skipped
  }[status];
  return <Component {...rest} />;
}
