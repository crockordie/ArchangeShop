import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.id) {
      toast.error("Please login to access admin dashboard");
      navigate("/login");
      return;
    }
    if (storedUser.role !== "admin") {
      toast.error("Admin access required");
      navigate("/");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 px-5">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <p className="text-lg mb-8">
        Welcome back, {user?.name}. Use the links below to manage products and view settings.
      </p>
      <div className="grid gap-5 max-w-md">
        <Link to="/admin/products" className="bg-secondaryBrown text-white py-5 px-6 text-xl text-center rounded-md">
          Manage Products
        </Link>
        <Link to="/admin/settings" className="bg-black text-white py-5 px-6 text-xl text-center rounded-md">
          Product Settings
        </Link>
        <Link to="/admin/users" className="bg-white border border-black text-black py-5 px-6 text-xl text-center rounded-md">
          Manage Users
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
