import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/codegen-logo.png"

const Navbar = () => {
  
  return (
    <nav class="bg-gradient-to-r from-purple-900 to-pink-400 rounded-xl pt-4 pb-4 text-white py-3 px-4 flex items-center justify-between">
    <a href="/"><img class="h-10 " src={Logo} alt="logo"></img></a>
    <div class="flex items-end">
        <Link class="text-sm px-4 py-2 leading-none rounded-full hover:bg-gray-700" to="/">Home</Link>
        <Link class="text-sm px-4 py-2 leading-none rounded-full hover:bg-gray-700" to="/about">About</Link>
        <Link class="text-sm px-4 py-2 leading-none rounded-full hover:bg-gray-700" to="/docs">Contact</Link>
        <Link class="text-sm px-4 py-2 leading-none rounded-full hover:bg-gray-700" to="/login">Login</Link>
    </div>
    
</nav>
  );
};

export default Navbar;
