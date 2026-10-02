import { useLocation } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
const MenuExplorer = () => {
  const location = useLocation();

  const items: { id: string; to: string; label: string; Icon: any }[] = [
    { id: "home", to: "/", label: "Home", Icon: HiOutlineHome },
    { id: "shop", to: "/shop", label: "Shop", Icon: HiOutlineShoppingBag },
    { id: "search", to: "/search", label: "Search", Icon: HiOutlineMagnifyingGlass },
    { id: "cart", to: "/cart", label: "Cart", Icon: HiOutlineShoppingCart },
  ];

  return (
    <nav className="hidden sm:flex items-center overflow-x-auto max-w-[36rem] mr-4">
      <ul className="flex gap-2 items-center">
        {items.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          const Icon = item.Icon;
          return (
              <li key={item.id} className="flex-shrink-0">
                <div
                  className={`flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors duration-150 ${
                    active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                >
                  <Icon className="text-lg" />
                  <span className="text-xs mt-0.5">{item.label}</span>
                </div>
              </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MenuExplorer;
