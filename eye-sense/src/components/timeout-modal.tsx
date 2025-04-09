import React from "react";
import { Link } from "react-router-dom";

const TimeoutModal = () => {
  return (
    <>
      <div className="w-screen h-screen absolute top-0 left-0 transparent-black-bg"></div>
      <div className="center-screen bg-white rounded-xl p-6">
        <h1 className="font-bold text-xl">Your session has expired.</h1>
        <p className="mt-1 mb-4">Please log in again to continue.</p>
        <Link to={`/auth`} state={{ redirectIsRegistering: false }}>
          <button className="btn blue-btn">Login</button>
        </Link>
      </div>
    </>
  );
};

export default TimeoutModal;
