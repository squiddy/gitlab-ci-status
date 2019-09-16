import React from 'react'; // eslint-disable-line no-unused-vars
import { useState, useEffect } from 'react';

function useClock(isTicking: boolean) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [diff, setDiff] = useState(0);

  function tick() {
    const now = Date.now();
    setDiff(diff + (now - lastUpdate) / 1000);
    setLastUpdate(now);
  }

  useEffect(() => {
    let timerId: number | null;

    if (isTicking) {
      timerId = window.setInterval(tick, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  });

  return diff;
}

export function Duration(props: { ticking?: boolean; value: number | null }) {
  const diff = useClock(props.ticking || false);
  const value = (props.value || 0) + diff;

  return (
    <>
      {Math.floor(value / 60)}m {Math.floor(value % 60)}s
    </>
  );
}
