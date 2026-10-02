import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import Button from "../components/Button";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = async () => {
    try {
      const response = await customFetch.get("/users");
      setUsers(response.data || []);
    } catch (e) {
      toast.error("Could not load users");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.id || storedUser.role !== "admin") {
      toast.error("Admin access required");
      return;
    }
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      String(user.id).includes(query)
    );
  }, [users, searchQuery]);

  const deleteUser = async (id: string) => {
    try {
      await customFetch.delete(`/users/${id}`);
      toast.success("User deleted");
      loadUsers();
    } catch (e) {
      toast.error("Failed to delete user");
    }
  };

  const resetPassword = async (user: User) => {
    const newPassword = window.prompt(`Enter new password for ${user.name} ${user.lastname}`);
    if (!newPassword) return;

    try {
      await customFetch.put(`/users/${user.id}`, { ...user, password: newPassword, confirmPassword: newPassword });
      toast.success("Password updated");
    } catch (e) {
      toast.error("Failed to reset password");
    }
  };

  const isAdmin = JSON.parse(localStorage.getItem("user") || "{}").role === "admin";

  if (!isAdmin) {
    return (
      <div className="max-w-screen-2xl mx-auto pt-24 px-5">
        <h1 className="text-3xl font-bold">Admin access required</h1>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 px-5">
      <h1 className="text-4xl font-bold mb-6">User Management</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xl border border-black p-3"
        />
      </div>
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="border border-black rounded-md p-4 bg-white flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-xl font-semibold">{user.name} {user.lastname}</h2>
              <p className="text-sm text-gray-700">{user.email}</p>
              <p className="text-sm text-gray-700">ID: {user.id}</p>
              <p className="text-sm text-gray-700">Role: {user.role || "customer"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button mode="brown" text="Reset Password" onClick={() => resetPassword(user)} />
              <Button mode="white" text="Delete Account" onClick={() => deleteUser(user.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
