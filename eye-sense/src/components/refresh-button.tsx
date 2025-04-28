import React, { useState } from "react";

const RefreshButton = ({ refreshFn }: { refreshFn: () => void }) => {
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const handleOnClick = () => {
    refreshFn();
    rotate();
  };

  const rotate = () => {
    console.log("rotating");
    setIsRotating(true);
  };

  const stopRotate = () => {
    console.log("stop rotating");
    setIsRotating(false);
  };

  return (
    <button
      className={`btn ${isRotating ? "rotate-right" : ""}`}
      onClick={handleOnClick}
      onAnimationEnd={stopRotate}
    >
      <i className="fa-solid fa-rotate-right text-xl"></i>
    </button>
  );
};

export default RefreshButton;
