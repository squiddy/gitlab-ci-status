import React from "react";

export function Avatar({ obj, className = "" }) {
  // Renders the avatar of either a user or project, if available. Falls back to
  // a svg placeholder otherwise.
  const imageBaseUrl = "http://gitlab.bof.mm.local";

  if (obj && obj.avatar_url) {
    // Handle both relative (gitlab) or absolute (e.g. gravatar) URLs.
    const isAbsolute = obj.avatar_url.startsWith("http");

    const finalUrl = isAbsolute
      ? obj.avatar_url
      : imageBaseUrl + obj.avatar_url;
    return <img className={`avatar ${className}`} src={finalUrl} alt="" />;
  } else {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        className={`avatar avatar-empty ${className}`}
      >
        <circle cx="7" cy="7" r="6" />
      </svg>
    );
  }
}
