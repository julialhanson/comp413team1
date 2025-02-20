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
        className="absolute right-2 mt-2 w-50 bg-white rounded-xl shadow-lg p-3 flex flex-col"
      >
        <Link className="hover-underline" to="/profile">
          Profile
        </Link>
        <Link className="hover-underline" to="/surveys">
          My Surveys
        </Link>
        <Link className="hover-underline" to="/survey-history">
          Survey History
        </Link>
        <Link className="hover-underline" to="/settings">
          Settings
        </Link>
      </div>
    </>
  );
};

export default ProfileMenu;
