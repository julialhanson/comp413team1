import React from "react";

const TimeoutModal = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="w-screen h-screen absolute top-0 left-0 transparent-black-bg z-20"></div>
      <div className="center-screen bg-white rounded-xl p-6 relative z-30">
        {children}
      </div>
    </>
  );
};

export default TimeoutModal;
