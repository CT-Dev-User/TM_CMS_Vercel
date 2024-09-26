"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./page.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contextApi/UserContext";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
} // Adjust this to match your app's root element

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const UpcomingBatchesCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategories, setCourseCategories] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filterbatches, setfilterbatches] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    program: "",
    date: "",
    timing: "",
    duration: "",
    mode: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filterbatches.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(filterbatches.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchPrograms();
      fetchBatches();
    }
  }, [userauth, router]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-extensive-program"
      );
      setPrograms(response.data);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-upcoming-batches"
      );
      setBatches(response.data);
      setfilterbatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchCourseCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  const filterPrograms = (category) => {
    const filteredData = programs.filter((item) => item.Category === category);
    setSelectedProgram(filteredData);
  };
  // Open modal for adding or editing
  const openModal = (batch = null) => {
    if (batch) {
      setEditMode(true);
      setEditId(batch._id);
      setFormData(batch);
    } else {
      setEditMode(false);
      setFormData({
        category: "",
        program: "",
        date: "",
        timing: "",
        duration: "",
        mode: "",
      });
    }
    setModalIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(
          `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/update-upcoming-batches/${editId}`,
          formData
        );
        setBatches(
          batches.map((batch) => (batch._id === editId ? formData : batch))
        );
      } else {
        const response = await axios.post(
          "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-upcoming-batches",
          formData
        );
        setBatches([...batches, response.data.upcomingBatch]);
      }
      closeModal();
    } catch (error) {
      console.error("Error saving batch:", error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-upcoming-batches/${id}`
        );
        Swal.fire("Deleted!", "Your data has been deleted.", "success");
        fetchBatches(); // Refresh data after deletion
      } catch (error) {
        Swal.fire("Error!", "There was an issue deleting the data.", "error");
      }
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setfilterbatches(batches);
    } else {
      setfilterbatches(batches.filter(name => name.program === e.target.value));
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-4 bg-gray-100 text-black">
          <div className=" flex justify-between ">
            <h1 className="text-2xl font-bold mb-4">Upcoming Batches</h1>
            <select
              className="p-2 border border-gray-300 rounded text-black"
              onChange={handleFilterChange}
            >
              <option value="">All program</option>
              {programs &&
                programs.map((data) => (
                  <option
                    key={data._id}
                    value={data.cardData.programName}
                  >
                    {data.cardData.programName}
                  </option>
                ))}
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => openModal()}
            >
              <FaPlus />
            </button>
          </div>

          <div className="overflow-x-auto mt-5">
            <table className="table-auto w-full mt-4">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Program</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Timing</th>
                  <th className="px-4 py-2">Duration</th>
                  <th className="px-4 py-2">Mode</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((batch) => (
                  <tr key={batch._id} className="border text-center">
                    <td className=" px-4 py-2">{batch.category}</td>
                    <td className=" px-4 py-2">{batch.program}</td>
                    <td className=" px-4 py-2">
                      {new Date(batch.date).toLocaleDateString()}
                    </td>
                    <td className=" px-4 py-2">{batch.timing}</td>
                    <td className=" px-4 py-2">{batch.duration}</td>
                    <td className=" px-4 py-2">{batch.mode}</td>
                    <td className=" px-4 py-2">
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                        onClick={() => openModal(batch)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(batch._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"
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
              className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"
                }`}
            >
              Next
            </button>
          </div>

          {/* Modal for Add/Edit Form */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className="modal w-[50%] mx-auto "
            overlayClassName="overlay"
          >
            <div div className="modal-content text-black">
              <h2 className="text-black">
                {editMode ? "Edit Batch" : "Add New Batch"}
              </h2>
              <form onSubmit={handleSubmit} className="text-black">
                <div className="mb-4">
                  <label className="block mb-2">Category:</label>

                  <select
                    name=""
                    id=""
                    className="w-full p-2 border rounded text-black"
                    onChange={(e) => {
                      {
                        setFormData({ ...formData, category: e.target.value });
                        filterPrograms(e.target.value);
                      }
                    }}
                  >
                    <option value="">Select category</option>
                    {courseCategories &&
                      courseCategories.map((data) => (
                        <option key={data._id} value={data.courseCategory}>
                          {data.courseCategory}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Program</label>
                  <select
                    name="category"
                    id=""
                    className="w-full p-2 border rounded text-black"
                    onChange={(e) => {
                      setFormData({ ...formData, program: e.target.value });
                    }}
                  >
                    <option value="">Select program</option>
                    {selectedProgram &&
                      selectedProgram.map((data) => (
                        <option
                          key={data._id}
                          value={data.cardData.programName}
                        >
                          {data.cardData.programName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Date:</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="border rounded w-full py-2 px-3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Timing:</label>
                  <input
                    type="text"
                    name="timing"
                    value={formData.timing}
                    onChange={handleInputChange}
                    className="border rounded w-full py-2 px-3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Duration:</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="border rounded w-full py-2 px-3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Mode:</label>
                  <input
                    type="text"
                    name="mode"
                    value={formData.mode}
                    onChange={handleInputChange}
                    className="border rounded w-full py-2 px-3"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editMode ? "Update Batch" : "Add Batch"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </form>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default UpcomingBatchesCMS;
