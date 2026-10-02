import { HiBars3 } from "react-icons/hi2";
import { HiOutlineUser } from "react-icons/hi2";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { HiOutlineHome } from "react-icons/hi2";
import { Link } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import MenuExplorer from "./MenuExplorer";
import { useState } from "react";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="relative mx-auto w-full max-w-screen-2xl px-3 py-4 text-black sm:px-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-[160px] items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <HiBars3 className="cursor-pointer text-2xl sm:text-3xl" />
            </button>
            <img
              src="/assets/Danie_Fashion_logo.PNG.png"
              alt="Daniela Shop"
              className="h-20 w-auto object-contain sm:h-24 md:h-28"
            />
          </div>

          <div className="hidden flex-1 justify-center sm:flex">
            <MenuExplorer />
          </div>

          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <Link to="/">
              <HiOutlineHome className="text-xl sm:text-2xl" />
            </Link>
            <Link to="/search">
              <HiOutlineMagnifyingGlass className="text-xl sm:text-2xl" />
            </Link>
            <Link to="/login">
              <HiOutlineUser className="text-xl sm:text-2xl" />
            </Link>
            <Link to="/cart">
              <HiOutlineShoppingCart className="text-xl sm:text-2xl" />
            </Link>
            <Link to="/admin">
              <span className="text-sm font-semibold sm:text-base">Admin</span>
            </Link>
          </div>

          <div className="flex w-full items-center justify-center sm:hidden">
            <Link
              to="/"
              className="pointer-events-auto text-2xl font-light tracking-[1.08px]"
            >
              ArchangeShop
            </Link>
          </div>
        </div>
      </header>
      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};
export default Header;
