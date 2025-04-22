import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "./profile-menu";

const Header = () => {
  const location = useLocation();

  const getLinkStyle = (path: string) => ({
    fontWeight: location.pathname === path ? "bold" : "normal",
    padding: "0px 10px",
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 flex flex-nowrap items-center justify-between w-screen h-12 py-2 px-4 bg-white">
        <Link className="tracking-wider font-bold text-lg" to="/auth">
          eye-
          <span className="dark-blue">sense</span>
        </Link>
        <nav>
          <Link to="/create-survey" style={getLinkStyle("/create-survey")}>
            create
          </Link>
          <Link to="/predict" style={getLinkStyle("/predict")}>
            predict
          </Link>
        </nav>

        <div className="h-full">
          <button
            className="aspect-square h-full cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img
              className="rounded-full"
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt=""
            />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <ProfileMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      )}
    </>
  );
};

export default Header;
