import React, { useState, useEffect } from "react";

import { Pipeline } from "./Pipeline";

function usePipelines() {
  const [pipelines, setPipelines] = useState([]);

  function update() {
    fetch("/initial")
      .then(res => res.json())
      .then(data => setPipelines(data));
  }

  useEffect(update, []);

  useEffect(() => {
    const timerId = setInterval(update, 10000);
    return () => {
      clearInterval(timerId);
    };
  });

  return pipelines;
}

function App() {
  const pipelines = usePipelines();

  return (
    <main className="container mx-auto">
      {pipelines.map(p => {
        return <Pipeline pipeline={p} key={p.id} />;
      })}
    </main>
  );
}

export default App;
