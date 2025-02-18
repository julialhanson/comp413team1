// import React from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const getLinkStyle = (path: string) => ({
    fontWeight: location.pathname === path ? "bold" : "normal",
    textDecoration: "none",
    padding: "10px",
  });

  return (
    <header className="fixed top-0 flex flex-nowrap items-center justify-between w-screen h-12 p-2 bg-white">
      <Link to="/">
        eye-
        <span className="font-bold">sense</span>
      </Link>
      <nav>
        <Link to="/create" style={getLinkStyle("/create")}>
          create
        </Link>
        <Link to="/predict" style={getLinkStyle("/predict")}>
          predict
        </Link>
      </nav>

      <img
        className="h-full rounded-full"
        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        alt=""
      />
    </header>
  );
};

export default Header;
