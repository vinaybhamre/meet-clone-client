import logo from "@/assets/googlemeet.svg";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-slate-50 sticky">
      <div className=" h-16 md:h-24 py-4  flex items-center justify-between">
        {/* logo */}
        <Link to="/">
          <div className="flex items-center gap-2">
            <img src={logo} alt="app logo" className=" md:h-20 pl-4" />
            <span className=" text-xl md:text-3xl font-semibold text-[#5f6368]">
              Google Meet
            </span>
          </div>
        </Link>
        {/* auth links */} 
        <div className="pr-8 flex justify-between items-center gap-4">
          <Link to="/login" className="text-lg md:text-3xl font-medium">
            Login
          </Link>
          <Link to="/register" className="text-lg md:text-3xl font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
