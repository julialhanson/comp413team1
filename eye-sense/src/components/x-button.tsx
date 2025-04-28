import React from "react";

const XButton = ({ resetFn }: { resetFn: () => void }) => {
  return (
    <button
      onClick={resetFn}
      className="circle-btn size-9 grey-btn absolute right-0 top-0"
    >
      <i className="fa-solid fa-xmark"></i>
    </button>
  );
};

export default XButton;
