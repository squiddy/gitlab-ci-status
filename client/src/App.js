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

function ToggleButton({ active, className, children, ...rest }) {
  return (
    <button
      className={`${
        active
          ? "bg-grey-darkest hover:bg-grey-darker text-grey-light"
          : "bg-grey-light hover:bg-grey text-grey-darkest"
      } font-bold py-2 px-4 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function App() {
  const pipelines = usePipelines();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const initialFilters = JSON.parse(window.localStorage.getItem("filters")) || {
    runningOnly: false
  };
  const [filters, setFilters] = useState(initialFilters);

  function setFilterRunningOnly(value) {
    setFilters({ ...filters, runningOnly: value });
  }

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
        <div className="inline-flex text-xs">
          <ToggleButton
            active={!filters.runningOnly}
            onClick={() => setFilterRunningOnly(false)}
            className="rounded-l"
          >
            Show all
          </ToggleButton>
          <ToggleButton
            active={filters.runningOnly}
            onClick={() => setFilterRunningOnly(true)}
            className="rounded-r"
          >
            Only running
          </ToggleButton>
        </div>
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
