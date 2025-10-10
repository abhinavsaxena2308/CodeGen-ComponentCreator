import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/codegen-logo.png"

const Navbar = () => {
  
  return (
    <div className="bg-black pt-6 pb-4">
      <nav className="bg-black border rounded-full border-gray-800 pt-3 pb-4 text-white py-3 px-4 flex items-center shadow-md shadow-green-700 backdrop-blur-sm justify-between mx-auto w-[90%] max-w-6xl">
        <a href="/">
          <img className="h-10" src={Logo} alt="logo" />
        </a>
        <div className="flex items-center gap-4 ">
          <Link className="text-lg font-mono hover:shadow-green-800 hover:shadow-md  px-4 py-2 leading-none rounded-full " to="/">Home</Link>
          <Link className="text-lg font-mono hover:shadow-green-800 hover:shadow-md  px-4 py-2 leading-none rounded-full" to="/about">About</Link>
          <Link className="text-lg font-mono hover:shadow-green-800 hover:shadow-md  px-4 py-2 leading-none rounded-full " to="/docs">Docs</Link>
          {/* <Link className="text-lg font-mono hover:shadow-green-800 hover:shadow-md  px-4 py-2 leading-none rounded-full " to="/login">Login</Link> */}
        </div>
        <Link to="/login"><button className="text-lg font-mono px-4 py-2 shadow-md shadow-green-600 leading-none rounded-full hover:bg-gray-700" to="/signup">Sign Up</button></Link>
      </nav>
    </div>

  );
};

export default Navbar;
