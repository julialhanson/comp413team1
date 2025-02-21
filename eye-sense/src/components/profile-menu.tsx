import { Link } from "react-router-dom";

type ProfileMenuProps = {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfileMenu = ({ isMenuOpen, setIsMenuOpen }: ProfileMenuProps) => {
  return (
    <>
      <div
        className="w-screen h-screen absolute top-0 left-0 bg-transparent"
        onClick={() => {
          console.log("clicked");
          setIsMenuOpen(!isMenuOpen);
        }}
      ></div>
      <div
        id="profile-menu"
        className="absolute right-2 mt-2 w-50 bg-white rounded-xl shadow-lg p-2 flex flex-col"
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
          to="/surveys"
        >
          <i className="fa-solid fa-list-ul mr-2"></i> My Surveys
        </Link>
        <Link
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover-darken"
          to="/survey-history"
        >
          <i className="fa-solid fa-list-check mr-2"></i> Survey History
        </Link>
        <Link
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover-darken"
          to="/settings"
        >
          <i className="fa-solid fa-gear mr-2"></i> Settings
        </Link>
      </div>
    </>
  );
};

export default ProfileMenu;
