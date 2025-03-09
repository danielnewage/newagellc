// Component/Employee.jsx
import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth } from "../Services/firebaseConfig";
import ActivityIndicator from "./ActivityIndicator"; // Adjust path if needed

const Employees = () => {
  const db = getFirestore();
  const employeesCollection = collection(db, "employees");

  // Employees state (fetched from Firestore)
  const [employees, setEmployees] = useState([]);
  // Loading state for data fetch
  const [loading, setLoading] = useState(true);

  // Modal control state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form state for add/update with updated fields
  const [formData, setFormData] = useState({
    id: null, // Will store Firestore document id when editing
    name: "",
    cnic: "",
    joiningDate: "",
    salary: "",
    role: "",
  });

  // Fetch employees from Firestore when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(employeesCollection);
        const employeesData = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [employeesCollection]);

  // Toggle Add/Edit Modal and reset form if needed
  const openFormModal = (employee = null) => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        id: null,
        name: "",
        cnic: "",
        joiningDate: "",
        salary: "",
        role: "",
      });
    }
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setFormData({
      id: null,
      name: "",
      cnic: "",
      joiningDate: "",
      salary: "",
      role: "",
    });
  };

  // Delete modal controls
  const openDeleteModal = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if all fields are filled
    if (
      !formData.name ||
      !formData.cnic ||
      !formData.joiningDate ||
      !formData.salary ||
      !formData.role
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (formData.id) {
        // Update existing employee in Firestore
        const employeeDocRef = doc(db, "employees", formData.id);
        await updateDoc(employeeDocRef, {
          name: formData.name,
          cnic: formData.cnic,
          joiningDate: formData.joiningDate,
          salary: formData.salary,
          role: formData.role,
        });
        // Update local state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === formData.id ? { ...formData } : emp
          )
        );
      } else {
        // Add new employee to Firestore
        const docRef = await addDoc(employeesCollection, {
          name: formData.name,
          cnic: formData.cnic,
          joiningDate: formData.joiningDate,
          salary: formData.salary,
          role: formData.role,
        });
        // Update local state with the new document id
        setEmployees((prev) => [
          ...prev,
          { id: docRef.id, ...formData },
        ]);
      }
      closeFormModal();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  // Handle delete employee
  const handleDelete = async () => {
    if (selectedEmployee) {
      try {
        await deleteDoc(doc(db, "employees", selectedEmployee.id));
        setEmployees((prev) =>
          prev.filter((emp) => emp.id !== selectedEmployee.id)
        );
        closeDeleteModal();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF("p", "pt");
    const tableColumn = ["ID", "Name", "CNIC", "Joining Date", "Salary", "Role"];
    const tableRows = employees.map((emp) => [
      emp.id,
      emp.name,
      emp.cnic,
      emp.joiningDate,
      emp.salary,
      emp.role,
    ]);
  
    doc.setFontSize(18);
    doc.text("Employee List", 40, 40);
    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 40, right: 40 },
    });
    doc.save("employee_list.pdf");
  };
  
  // Export data as Excel using xlsx
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employee_list.xlsx");
  };

  // If loading, show ActivityIndicator
  if (loading) {
    return <ActivityIndicator message="Loading ..." />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Employee Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportPDF}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Export Excel
          </button>
          <button
            onClick={() => openFormModal()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">CNIC</th>
              <th className="px-4 py-2 text-left">Joining Date</th>
              <th className="px-4 py-2 text-left">Salary</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-t">
                <td className="px-4 py-2">{employee.id}</td>
                <td className="px-4 py-2">{employee.name}</td>
                <td className="px-4 py-2">{employee.cnic}</td>
                <td className="px-4 py-2">{employee.joiningDate}</td>
                <td className="px-4 py-2">{employee.salary}</td>
                <td className="px-4 py-2">{employee.role}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => openFormModal(employee)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(employee)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {formData.id ? "Edit Employee" : "Add Employee"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="cnic">
                  CNIC
                </label>
                <input
                  type="text"
                  id="cnic"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter CNIC (e.g., 12345-6789012-3)"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="joiningDate"
                >
                  Joining Date
                </label>
                <input
                  type="date"
                  id="joiningDate"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="salary">
                  Salary
                </label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter salary (e.g., RS: 5000)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Select Role</option>
                  <option value="Sales Agent">Sales Agent</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Manager">Manager</option>
                  <option value="IT Lead">IT Lead</option>
                  <option value="Team Lead & Dispatcher">
                    Team Lead & Dispatcher
                  </option>
                  <option value="COO">COO</option>
                  <option value="CFO">CFO</option>
                  <option value="CEO">CEO</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  {formData.id ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedEmployee.name}</span>?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
