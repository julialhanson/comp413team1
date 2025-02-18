// import React from "react";

export default function Header() {
  return (
    <header className="flex flex-nowrap items-center justify-between w-screen h-10">
      <h1>eye-sense</h1>
      <ul className="flex">
        <li>
          <a href="">create</a>
        </li>
        <li>
          <a href="">predict</a>
        </li>
      </ul>

      <img
        className="h-full rounded-full"
        src="https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/"
        alt=""
      />
    </header>
  );
}
