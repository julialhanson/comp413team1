import React from "react";

const ToggleButton = ({
  isToggled,
  toggleFunction,
}: {
  isToggled: boolean;
  toggleFunction: () => void;
}) => {
  return (
    <>
      <button
        title="Toggle eye tracking"
        className={`toggle-btn${isToggled ? " toggled" : ""}`}
        onClick={toggleFunction}
      >
        <div className="thumb"></div>
      </button>
    </>
  );
};

export default ToggleButton;
