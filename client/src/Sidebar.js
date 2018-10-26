import React from "react"; // eslint-disable-line no-unused-vars

export function Sidebar(props) {
  if (!props.isVisible) {
    return (
      <aside className="px-4 my-4">
        <svg
          onClick={props.onToggleVisibility}
          className="fill-current w-4 h-4 cursor-pointer text-grey"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </aside>
    );
  }

  return (
    <aside className="px-4 pr-8 py-4 items-strech bg-white">
      <svg
        onClick={props.onToggleVisibility}
        className="fill-current w-4 h-4 cursor-pointer text-black block mb-8"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
      </svg>
      {props.children}
    </aside>
  );
}
