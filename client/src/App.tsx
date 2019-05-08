import React, { useState, useEffect } from 'react';

import { Pipeline } from './Pipeline';
import { Sidebar } from './Sidebar';
import { isPipelineFinished } from './utils';
import { PipelineData } from './types';

function usePipelines(): PipelineData[] {
  const [pipelines, setPipelines] = useState([]);

  function update() {
    fetch('/initial')
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

function ToggleButton({
  active,
  className,
  children,
  ...rest
}: {
  active: boolean;
  className: string;
  children: JSX.Element[] | JSX.Element;
} & any) {
  return (
    <button
      className={`${
        active
          ? 'bg-grey-darkest hover:bg-grey-darker text-grey-light'
          : 'bg-grey-light hover:bg-grey text-grey-darkest'
      } font-bold py-2 px-4 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface FilterConfig {
  runningOnly: boolean;
  projectsOnly: { [key: string]: boolean };
}

function filterPipelines(pipelines: PipelineData[], filters: FilterConfig) {
  const anyProjectFilterSet = Object.values(filters.projectsOnly).some(v => v);
  return pipelines
    .filter(p => (filters.runningOnly ? !isPipelineFinished(p.status) : true))
    .filter(p =>
      anyProjectFilterSet ? filters.projectsOnly[p.project.name] : true
    );
}

function App() {
  const pipelines = usePipelines();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const data = window.localStorage.getItem('filters');
  const initialFilters = data
    ? JSON.parse(data)
    : {
        runningOnly: false,
        projectsOnly: {}
      };
  if (!initialFilters.projectsOnly) {
    initialFilters.projectsOnly = {};
  }
  const [filters, setFilters] = useState(initialFilters);

  function setFilterRunningOnly(value: boolean) {
    setFilters({ ...filters, runningOnly: value });
  }

  function toggleProjectFilter(project: string) {
    setFilters({
      ...filters,
      projectsOnly: {
        ...filters.projectsOnly,
        [project]: !filters.projectsOnly[project]
      }
    });
  }

  const projectNames = Array.from(new Set(pipelines.map(p => p.project.name)));

  const filteredPipelines = filterPipelines(pipelines, filters);

  useEffect(() => {
    window.localStorage.setItem('filters', JSON.stringify(filters));
  });

  return (
    <div className="flex justify-between min-h-screen">
      <Sidebar
        isVisible={sidebarVisible}
        onToggleVisibility={() => setSidebarVisible(!sidebarVisible)}
      >
        <h4 className="font-light mb-2 text-xs">Status</h4>
        <div className="inline-flex text-xs mb-4">
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

        <h4 className="font-light mb-2 text-xs">Projects</h4>
        <div className="text-xs">
          {projectNames.map(name => (
            <ToggleButton
              active={filters.projectsOnly[name]}
              onClick={() => toggleProjectFilter(name)}
              className="w-full mb-1 rounded"
            >
              {name}
            </ToggleButton>
          ))}
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
