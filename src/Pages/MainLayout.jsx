// src/Pages/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
    AiOutlineMenu,
    AiOutlineClose,
    AiOutlineDashboard,
    AiOutlineUser,
    AiOutlineBank,
    AiOutlineCalendar,
    AiOutlineDollarCircle,
    AiOutlineSetting,
    AiOutlineSearch,
} from "react-icons/ai";
import { FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/logo.png"; // Ensure logo is a Base64 string or accessible format
import { signOut } from "firebase/auth";
import { auth } from "../Services/firebaseConfig";
import { useNavigate } from "react-router-dom";
const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Redirect to login page after successful sign out
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };
    return (
        <div className="flex h-screen bg-gray-100 text-gray-800">
            {/* Persistent Sidebar */}
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-16"
                    } bg-[#0a2635] flex flex-col transition-all duration-300 overflow-hidden`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 bg-[#0a2635]">
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold text-white">Newage Dispatch</span>
                    ) : (
                        <span className="text-xl font-bold text-white"></span>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="text-white hover:text-gray-300 transition-colors"
                    >
                        {isSidebarOpen ? (
                            <AiOutlineClose size={20} />
                        ) : (
                            <AiOutlineMenu size={20} />
                        )}
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 px-2 py-4">
                    <ul className="space-y-2">
                        <li>
                            {/* Use relative paths so that the parent "/admin" is preserved */}
                            <Link
                                to="dashboard"
                                className="flex items-center p-2 text-white rounded hover:bg-[#0c3044] transition-colors"
                            >
                                <AiOutlineDashboard className="text-xl" />
                                {isSidebarOpen && <span className="ml-3">Dashboard</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="employee"
                                className="flex items-center p-2 text-white rounded hover:bg-[#0c3044] transition-colors"
                            >
                                <AiOutlineUser className="text-xl" />
                                {isSidebarOpen && <span className="ml-3">Employee</span>}
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="management"
                                className="flex items-center p-2 text-white rounded hover:bg-[#0c3044] transition-colors"
                            >
                                <AiOutlineBank className="text-xl" />
                                {isSidebarOpen && <span className="ml-3">Manage Salary</span>}
                            </Link>
                        </li>
                        {/* <li>
              <a
                href="#"
                className="flex items-center p-2 text-white rounded hover:bg-[#0c3044] transition-colors"
              >
                <AiOutlineCalendar className="text-xl" />
                {isSidebarOpen && <span className="ml-3">Leave</span>}
              </a>
            </li> */}
                        <li>
                            <Link
                                to="EmployeeSalaryList"
                                className="flex items-center p-2 text-white rounded hover:bg-[#0c3044] transition-colors"
                            >
                                <AiOutlineDollarCircle className="text-xl" />
                                {isSidebarOpen && <span className="ml-3">Salary List</span>}
                            </Link>
                        </li>
                        <li>
                            <a
                                href="#"
                                className="flex items-center p-2 text-white rounded hover:bg-[#0c3044] transition-colors"
                            >
                                <AiOutlineSetting className="text-xl" />
                                {isSidebarOpen && <span className="ml-3">Settings</span>}
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Persistent Header */}
                <header className="flex items-center justify-between bg-white shadow p-4">
                    {/* Search Bar */}
                    <div className="flex items-center space-x-2 bg-gray-100 rounded px-2 py-1">
                        <AiOutlineSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent focus:outline-none text-sm"
                        />
                    </div>
                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src={logo}
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="hidden sm:block font-medium">Admin</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors"
                        >
                            <FaSignOutAlt />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </header>

                <main className="p-6 flex flex-col space-y-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
