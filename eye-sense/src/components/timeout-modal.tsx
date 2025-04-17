import React from "react";
import { Link } from "react-router-dom";
import Modal from "./modal";

const TimeoutModal = () => {
  return (
    <Modal>
      <h1 className="font-bold text-xl">Your session has expired.</h1>
      <p className="mt-1 mb-4">
        Please log in again to continue or refresh the page.
      </p>

      <center>
        <Link to={`/auth`} state={{ redirectIsRegistering: false }}>
          <button className="btn blue-btn mr-2">Login</button>
        </Link>

        <button
          className="btn blue-btn"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </center>
    </Modal>
  );
};

export default TimeoutModal;
