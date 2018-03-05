import React from "react";

import { Avatar } from "./Avatar";
import { StatusIcon } from "./StatusIcon";

export function Pipeline({ pipeline }) {
  return (
    <div className={`queue-entry`}>
      <div className="queue-entry-body">
        <div className="avatars">
          <Avatar obj={pipeline.user} />
          <Avatar obj={pipeline.project} />
        </div>
        <div className="info">
          <strong>{pipeline.project.name}</strong>
          {pipeline.ref}
        </div>
        <div className={`status-info status-${pipeline.status}`}>
          {pipeline.status}
          <StatusIcon status={pipeline.status} />
        </div>
      </div>
      <div className="queue-entry-footer">
        <PipelineGraph builds={pipeline.builds} />
      </div>
    </div>
  );
}

export function PipelineGraph({ builds }) {
  return (
    <ul className="pipeline-graph">
      {builds.filter(b => b).map((b, idx) => (
        <li key={idx}>
          <StatusIcon title={b._raw.name} status={b.status} />
        </li>
      ))}
    </ul>
  );
}
