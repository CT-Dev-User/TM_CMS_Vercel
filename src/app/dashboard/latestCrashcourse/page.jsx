"use client";
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import Modal from "react-modal";
import "./page.css";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const CrashCourseCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategories, setCourseCategories] = useState([]);
  const [crashCourses, setCrashCourses] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    crashCourseCard: {
      programstatus: "",
      programName: "",
      programDuration: "",
      skillsYouDeveloped: "",
      bgGradientColor: "",
    },
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = crashCourses.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(crashCourses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchCrashCourses();
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

  const fetchCrashCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-crash-courses"
      );
      setCrashCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching crash courses:", error);
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      category: "",
      crashCourseCard: {
        programstatus: "",
        programName: "",
        programDuration: "",
        skillsYouDeveloped: "",
        bgGradientColor: "",
      },
    });
    setIsEdit(false);
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.crashCourseCard) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        crashCourseCard: {
          ...prevFormData.crashCourseCard,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = {
      category: formData.category,
      crashCourseCard: JSON.stringify(formData.crashCourseCard),
    };

    try {
      if (isEdit) {
        await axios.put(
          `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/edit-crash-course/${editId}`,
          formDataToSend,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        Swal.fire("Success", "Crash course updated successfully.", "success");
      } else {
        await axios.post(
          "https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/add-crash-course",
          formDataToSend,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        Swal.fire("Success", "Crash course added successfully.", "success");
      }
      fetchCrashCourses();
      closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error", "Error submitting form. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    // Show a confirmation popup before deletion
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/delete-crash-course-by-id/${id}`
          );
          Swal.fire("Deleted!", "Crash course has been deleted.", "success");
          fetchCrashCourses();
        } catch (error) {
          console.error("Error deleting crash course:", error);
          Swal.fire(
            "Error",
            "There was a problem deleting the crash course. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const openEditModal = (crashCourse) => {
    setFormData({
      category: crashCourse.category,
      crashCourseCard: crashCourse.crashCourseCard,
    });
    setIsEdit(true);
    setEditId(crashCourse._id);
    openModal();
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-4 text-black bg-gray-100">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4 ">Crash Course</h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              onClick={openModal}
            >
              <FaPlus />
            </button>
          </div>
          <table className="min-w-full bg-white text-black">
            <thead className="bg-gray-800 text-white">
              <tr className=" border-b border-gray-200">
                <th className="py-2 px-4 border-b border-gray-200">Category</th>
                <th className="py-2 px-4 border-b ">Program Status</th>
                <th className="py-2 px-4 border-b ">Program Name</th>
                <th className="py-2 px-4 border-b ">Program Duration</th>
                <th className="py-2 px-4 border-b ">Skills You Developed</th>
                <th className="py-2 px-4 border-b ">Bg gradient</th>
                <th className="py-2 px-4 border-b ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((crashCourse) => (
                <tr key={crashCourse._id} className="text-center border-b">
                  <td className="py-2 px-4 ">{crashCourse.category}</td>
                  <td className="py-2 px-4 ">
                    {crashCourse.crashCourseCard.programstatus}
                  </td>
                  <td className="py-2 px-4 ">
                    {crashCourse.crashCourseCard.programName}
                  </td>
                  <td className="py-2 px-4 ">
                    {crashCourse.crashCourseCard.programDuration}
                  </td>
                  <td className="py-2 px-4 ">
                    {crashCourse.crashCourseCard.skillsYouDeveloped}
                  </td>
                  <td className="py-2 px-4 ">
                    {crashCourse.crashCourseCard.bgGradientColor}
                  </td>
                  <td className="py-2 px-4 ">
                    <button
                      className="text-green-500 hover:text-green-700 mr-4"
                      onClick={() => openEditModal(crashCourse)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(crashCourse._id)}
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
          
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Crash Course Modal"
            className="modal w-[50%] text-black"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Crash Course" : "Add New Crash Course"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  id=""
                  className="block w-full p-2 border mb-4"
                  onChange={handleInputChange}
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
                <label className="block text-gray-700 mb-2">
                  Program Status
                </label>
                <input
                  type="text"
                  name="programstatus"
                  value={formData.crashCourseCard.programstatus}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Program Name</label>
                <input
                  type="text"
                  name="programName"
                  value={formData.crashCourseCard.programName}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Program Duration
                </label>
                <input
                  type="text"
                  name="programDuration"
                  value={formData.crashCourseCard.programDuration}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Skills You Developed (comma saperated)
                </label>
                <input
                  type="text"
                  name="skillsYouDeveloped"
                  value={formData.crashCourseCard.skillsYouDeveloped}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Background Gradient Color (comma saperated)
                </label>
                <input
                  type="text"
                  name="bgGradientColor"
                  value={formData.crashCourseCard.bgGradientColor}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                {isEdit ? "Update" : "Submit"}
              </button>
            </form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default CrashCourseCMS;
