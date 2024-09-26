"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import HireFromForm from "./HireFromForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contextApi/UserContext";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const HireFromTable = () => {
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hireFromData, setHireFromData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const router = useRouter();
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
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
      fetchHireFromData();
      fetchCourseCategories();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://backend-neon-nu.vercel.app/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchHireFromData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://backend-neon-nu.vercel.app/get-hire-from");
      setHireFromData(response.data);
      setFilteredPrograms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Hire From data:", error);
    }
  };

  const handleEditClick = (data) => {
    setEditData(data);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
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
        await axios.delete(`https://backend-neon-nu.vercel.app/delete-hire-from/${id}`);
        Swal.fire("Deleted!", "Your data has been deleted.", "success");
        fetchHireFromData(); // Refresh data after deletion
      } catch (error) {
        Swal.fire("Error!", "There was an issue deleting the data.", "error");
      }
    }
  };

  const handleAddClick = () => {
    setEditData(null);
    setShowModal(true);
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(hireFromData);
    } else {
      setFilteredPrograms(
        hireFromData.filter((category) => category.category === e.target.value)
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
        <div className="container mx-auto text-black p-4 bg-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Hire from Us</h1>
            <div className="flex items-center space-x-4">
              <select
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded text-black"
              >
                <option value="">All Categories</option>
                {courseCategories.map((category) => (
                  <option key={category._id} value={category.courseCategory}>
                    {category.courseCategory}
                  </option>
                ))}
              </select>
              <button
                className="bg-blue-500 text-white p-2 rounded"
                onClick={handleAddClick}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="w-full">
            <table className="w-full bg-white table-fixed">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-2 w-10">Category</th>
                  <th className="px-6 py-2 w-10">Technical Highlights</th>
                  <th className="px-6 py-2 w-10">Tools Covered</th>
                  <th className="px-6 py-2 w-10">Inventory Available</th>
                  <th className="px-6 py-2 w-14">
                    <p>Professional</p> <p> AptitudeTest</p>
                  </th>
                  <th className="px-6 py-2 w-10">MindsetBatch</th>
                  <th className="px-6 py-2 w-10 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((data) => (
                  <tr key={data._id} className="border">
                    <td className="px-6 py-2 w-10">{data.category}</td>
                    <td className="px-6 py-2 w-10">
                      <button
                        onClick={() => {
                          router.push(
                            `/dashboard/latestHirefromUs/technicalHIghLights/${data.category}`
                          );
                        }}
                        className="bg-green-400 mr-3 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        View
                      </button>
                    </td>
                    <td className="border px-6 py-2 w-10">
                      <button
                        onClick={() => {
                          router.push(
                            `/dashboard/latestHirefromUs/toolsCovered/${data.category}`
                          );
                        }}
                        className="bg-green-400 mr-3 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-2 w-10">
                      {data.inventoryAvailable.map((item, index) => (
                        <div key={index} className="mb-2">
                          <strong>Number:</strong> {item.number} <br />
                          <strong>Title:</strong> {item.title}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-2 w-14 flex flex-col">
                      <p>
                        <strong>Professional:-</strong>
                        {data.ProfessionalSpokenEnglishTrainingSession}
                      </p>
                      <p>
                        <strong>Aptitude:-</strong>
                        {data.AptitudeTestAndLogicalReasoningCriticalThinking}
                      </p>
                    </td>
                    <td className="px-6 py-2 w-10">
                      {data.MindsetBatchForGrowthInCareer}
                    </td>
                    <td className="px-6 py-2 w-10 text-center">
                      <button
                        onClick={() => handleEditClick(data)}
                        className="mr-4 text-green-500 hover:text-green-700"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(data._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
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

          {showModal && (
            <HireFromForm
              showModal={showModal}
              setShowModal={setShowModal}
              editData={editData}
              fetchHireFromData={fetchHireFromData}
            />
          )}
        </div>
      )}
    </>
  );
};

export default HireFromTable;
