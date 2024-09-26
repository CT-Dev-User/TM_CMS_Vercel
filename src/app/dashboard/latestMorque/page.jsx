"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./page.css";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const MorqueCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategories, setCourseCategories] = useState([]);
  const [morqueData, setMorqueData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    batchStarts: "",
    seats: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  // for dropdown
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
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
  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchMorqueData();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMorqueData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-morqueData");
      setMorqueData(response.data);
      setFilteredPrograms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching morque data:", error);
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      category: "",
      batchStarts: "",
      seats: "",
    });
    setIsEdit(false);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(
          `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/update-morqueData/${editId}`,
          formData
        );
        Swal.fire("Success", "Add batch ad successfully", "success");
      } else {
        await axios.post("https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/add-morqueData", formData);
        Swal.fire("Success", "Edit batch ad successfully", "success");
      }
      fetchMorqueData();
      closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error", "error in submitting data", "success");
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this ad.? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/delete-morqueData/${id}`);
        Swal.fire("Deleted!", "The ad. has been deleted.", "success");
        fetchMorqueData();
      }
    } catch (err) {
      console.error("Error deleting data:", err);
      Swal.fire("Error!", "There was an error deleting the ad.", "error");
    }
  };

  const openEditModal = (data) => {
    setFormData({
      category: data.category,
      batchStarts: data.batchStarts,
      seats: data.seats,
    });
    setIsEdit(true);
    setEditId(data._id);
    openModal();
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(morqueData);
    } else {
      setFilteredPrograms(
        morqueData.filter((category) => category.category === e.target.value)
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
        <div className="container mx-auto p-4 text-black bg-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold">Morque Data CMS</h1>
            <div className="flex items-center space-x-3">
              <select
                onChange={handleFilterChange}
                className="p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {courseCategories.map((category) => (
                  <option key={category._id} value={category.courseCategory}>
                    {category.courseCategory}
                  </option>
                ))}
              </select>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition-colors"
                onClick={openModal}
              >
                <FaPlus className="inline-block" />
                <span className="ml-2">Add New</span>
              </button>
            </div>
          </div>

          <table className="min-w-full border border-gray-200 ">
            <thead className="bg-gray-800 text-white border-b">
              <tr>
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Batch Starts</th>
                <th className="py-2 px-4">Seats</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((data) => (
                <tr
                  key={data._id}
                  className="text-center  border-b border-gray-200"
                >
                  <td className="py-2 px-4">{data.category}</td>
                  <td className="py-2 px-4">{data.batchStarts}</td>
                  <td className="py-2 px-4">{data.seats}</td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => openEditModal(data)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(data._id)}
                    >
                      Delete
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
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Morque Data Modal"
            className="modal w-[50%] text-black"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Morque Data" : "Add New Morque Data"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="Category"
                  id=""
                  className="block w-full p-2 border mb-4"
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                  }}
                >
                  <option value="">select category</option>
                  {courseCategories &&
                    courseCategories.map((data, index) => {
                      return (
                        <option value={data.courseCategory} key={index}>
                          {data.courseCategory}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Batch Starts</label>
                <input
                  type="text"
                  name="batchStarts"
                  value={formData.batchStarts}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Seats</label>
                <input
                  type="text"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="flex justify-end ps-3">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  {isEdit ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  className="bg-grey ms-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default MorqueCMS;
