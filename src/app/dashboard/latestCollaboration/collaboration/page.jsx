"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const CollaborationTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collaborations, setCollaborations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    cName: "",
    cCity: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // for dropdown
  const category = ["College", "Company"];
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCollaborations();
    }
  }, [userauth, router]);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-collaborations"
      );
      setCollaborations(response.data);
      setFilteredPrograms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching collaborations:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/edit-collaboration-by-id/${editId}`,
          formData
        );
        Swal.fire(
          "Success",
          "Collaboration data updated successfully",
          "success"
        );
        setEditMode(false);
        setEditId(null);
      } else {
        await axios.post("https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/add-collaboration", formData);
        Swal.fire(
          "Success",
          "Collaboration data added successfully",
          "success"
        );
      }
      fetchCollaborations();
      setShowPopup(false);
      setFormData({
        category: "",
        cName: "",
        cCity: "",
      });
    } catch (error) {
      console.error("Error adding/editing collaboration:", error);
      Swal.fire(
        "Error",
        "Error adding/editing collaboration. Please try again.",
        "error"
      );
    }
  };

  const handleEditCollaborationData = (collab) => {
    setFormData({
      category: collab.category,
      cName: collab.cName,
      cCity: collab.cCity,
    });
    setEditMode(true);
    setEditId(collab._id);
    setShowPopup(true);
  };

  const handleRemoveCollaborationData = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this testimonial? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/delete-collaboration-by-id/${id}`
          );
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The collaboration has been deleted.",
            confirmButtonText: "OK",
          }).then(() => {
            fetchCollaborations();
          });
        } catch (err) {
          console.error("Error deleting data:", err);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "There was an error deleting the collaboration.",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrograms.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(collaborations);
    } else {
      setFilteredPrograms(
        collaborations.filter(
          (category) => category.category === e.target.value
        )
      );
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="p-6  bg-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-black">Collaborations</h1>
            <select
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded text-black"
            >
              <option value="">All Categories</option>
              {category.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
              onClick={() => setShowPopup(true)}
            >
              <FaPlus />
            </button>
          </div>
          <table className="min-w-full bg-white border border-gray-200 text-black">
            <thead className="bg-gray-800 text-white border-b">
              <tr>
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">City</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((collab) => (
                <tr key={collab._id} className="text-center border-b">
                  <td className="py-2 px-4 ">{collab.category}</td>
                  <td className="py-2 px-4 ">{collab.cName}</td>
                  <td className="py-2 px-4 ">{collab.cCity}</td>
                  <td className="py-2 px-4 ">
                    <button
                      className="text-green-500 hover:text-green-700 mr-4"
                      onClick={() => handleEditCollaborationData(collab)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveCollaborationData(collab._id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
            >
              Previous
            </button>

            <span className="px-4 py-2 text-lg font-semibold text-black">
              {currentPage}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
            >
              Next
            </button>
          </div>

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl mb-4">
                  {editMode ? "Edit Collaboration" : "Add Collaboration"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="College">College</option>
                      <option value="Company">Company</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      name="cName"
                      value={formData.cName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">City</label>
                    <input
                      type="text"
                      name="cCity"
                      value={formData.cCity}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                      onClick={() => {
                        setShowPopup(false);
                        setEditMode(false);
                        setEditId(null);
                        setFormData({
                          category: "",
                          cName: "",
                          cCity: "",
                        });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      {editMode ? "Save Changes" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CollaborationTable;
