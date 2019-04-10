import React, { ClassAttributes, SVGAttributes } from 'react';

import { ReactComponent as Failed } from './images/failed.svg';
import { ReactComponent as Success } from './images/success.svg';
import { ReactComponent as Skipped } from './images/skipped.svg';
import { ReactComponent as Running } from './images/running.svg';
import { ReactComponent as Created } from './images/created.svg';
import { ReactComponent as Pending } from './images/pending.svg';
import { Status } from './types';

const Components: { [index: string]: React.FunctionComponent } = {
  [Status.Failed]: Failed,
  [Status.Success]: Success,
  [Status.Skipped]: Skipped,
  [Status.Canceled]: Skipped,
  [Status.Running]: Running,
  [Status.Created]: Created,
  [Status.Pending]: Pending,
  [Status.Manual]: Skipped
};

// FIXME Using any here on the props, because I have no idea how to define all
// possible SVG attributes as props.
export function StatusIcon({ status, ...rest }: { status: Status } & any) {
  // Renders a visual icon for the build/pipeline status.
  const Component = Components[status];
  return <Component {...rest} />;
}
