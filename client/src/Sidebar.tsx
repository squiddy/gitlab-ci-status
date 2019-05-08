import React from 'react'; // eslint-disable-line no-unused-vars

import GitlabLogo from './images/gitlab_logo.svg';

export function Sidebar(props: {
  isVisible: boolean;
  onToggleVisibility: () => void;
  children: JSX.Element[] | JSX.Element;
}) {
  if (!props.isVisible) {
    return (
      <aside className="px-4 max-h-screen sticky pin-t">
        <svg
          onClick={props.onToggleVisibility}
          className="fill-current my-4 w-4 h-4 cursor-pointer text-grey"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </aside>
    );
  }

  return (
    <aside className="px-4 py-4 items-strech bg-white shadow max-h-screen sticky pin-t">
      <div className="top-4">
        <svg
          onClick={props.onToggleVisibility}
          className="fill-current w-4 h-4 cursor-pointer text-black block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
        </svg>

        <div className="text-center mb-8">
          <img className="w-24 mb-2" src={GitlabLogo} alt="Gitlab logo" />
          <h1 className="text-lg text-grey-dark font-light">
            GitLab CI Status
          </h1>
        </div>
        {props.children}
      </div>
    </aside>
  );
}
