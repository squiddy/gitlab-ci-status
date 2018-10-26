import React, { useState, useEffect } from "react";

import { Pipeline } from "./Pipeline";
import { Sidebar } from "./Sidebar";
import { isPipelineFinished } from "./utils";

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
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const initialFilters = JSON.parse(window.localStorage.getItem("filters")) || {
    runningOnly: false
  };
  const [filters, setFilters] = useState(initialFilters);

  const filteredPipelines = pipelines.filter(
    p => (filters.runningOnly ? !isPipelineFinished(p.status) : true)
  );

  useEffect(() => {
    window.localStorage.setItem("filters", JSON.stringify(filters));
  });

  return (
    <div className="flex justify-between min-h-screen">
      <Sidebar
        isVisible={sidebarVisible}
        onToggleVisibility={() => setSidebarVisible(!sidebarVisible)}
      >
        <label className="text-sm">
          <input
            className="mr-4"
            type="checkbox"
            checked={filters.runningOnly}
            onChange={() =>
              setFilters({ ...filters, runningOnly: !filters.runningOnly })
            }
          />
          Show running only
        </label>
      </Sidebar>
      <div
        className="flex-grow my-4"
        style={{
          opacity: sidebarVisible ? 0.5 : 1
        }}
      >
        <main className="-pl-12 container mx-auto">
          {filteredPipelines.map(p => {
            return <Pipeline pipeline={p} key={p.id} />;
          })}
        </main>
      </div>
    </div>
  );
}

export default App;
