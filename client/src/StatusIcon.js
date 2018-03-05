import React from "react";

import failed from "./images/failed.svg";
import success from "./images/success.svg";
import skipped from "./images/skipped.svg";
import running from "./images/running.svg";
import created from "./images/created.svg";
import pending from "./images/pending.svg";

export function StatusIcon({ status, title }) {
  // Renders a visual icon for the build/pipeline status.
  const url = {
    failed,
    success,
    skipped,
    canceled: skipped,
    running,
    created,
    pending
  }[status];
  return <img title={title} alt="" src={url} />;
}
