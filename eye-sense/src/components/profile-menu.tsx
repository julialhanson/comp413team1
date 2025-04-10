import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../controllers/user-controller.ts";

type ProfileMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileMenu = ({ isMenuOpen, setIsMenuOpen }: ProfileMenuProps) => {
  const [username, setUsername] = useState<string>();

  useEffect(() => {
    getCurrentUser().then((user) => setUsername(user.username));
  }, []);

  return (
    <>
      <div
        className="z-40 w-screen h-screen absolute top-0 left-0 bg-transparent"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen);
        }}
      ></div>
      <div
        id="profile-menu"
        className="z-50 absolute top-12 right-2 mt-2 w-50 bg-white rounded-xl shadow-lg p-2 flex flex-col"
      >
        <Link
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover-darken"
          to="/profile"
        >
          <i className="fa-solid fa-user mr-2"></i> Profile
        </Link>
        <Link
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover-darken"
          to={`/profile/${username}/surveys`}
        >
          <i className="fa-solid fa-list-ul mr-2"></i> My Surveys
        </Link>
        <Link
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover-darken"
          to={`/profile/${username}/response-history`}
        >
          <i className="fa-solid fa-list-check mr-2"></i> Response History
        </Link>
        <Link
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover-darken"
          to="/settings"
        >
          <i className="fa-solid fa-gear mr-2"></i> Settings
        </Link>

        <Link
          onClick={() => {
            logoutUser();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="hover-darken"
          to="/auth"
          state={{ redirectIsRegistering: false }}
        >
          <i className="fa-solid fa-right-from-bracket mr-2"></i> Logout
        </Link>
      </div>
    </>
  );
};

export default ProfileMenu;
