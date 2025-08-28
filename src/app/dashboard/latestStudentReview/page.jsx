"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./page.css";
import Swal from "sweetalert2";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const StudentReviewCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategories, setCourseCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([])
  const imagePreviewRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    studentName: "",
    profilePic: null,
    jobRole: "",
    companyName: "",
    review: "",
    importantPoints: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const [imagePreview, setImagePreview] = useState(null);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchStudentReviewData();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/get-all-coursecategory"
      );
      setCourseCategories(response.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchStudentReviewData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/get-all-student-review-data"
      );
      setReviews(response.data);
      setFilteredReviews(response.data)
      setLoading(false);
    } catch (error) {
      console.error("Error fetching student review data:", error);
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(category => category.category === e.target.value));
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      category: "",
      studentName: "",
      profilePic: null,
      jobRole: "",
      companyName: "",
      review: "",
      importantPoints: "",
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
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    // Update form data
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: file,
    }));

    // Update image preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null); // Clear the image preview state
    if (imagePreviewRef.current) {
      imagePreviewRef.current.src = ""; // Clear the preview image
    }
    if (imagePreviewRef.current) {
      imagePreviewRef.current.value = ""; // Clear the file input field
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      if (isEdit) {
        await axios.put(
          `https://trialtmbackend.vercel.app/edit-student-review-data/${editId}`,
          formDataToSend
        );
        Swal.fire("Success", "Add St Review successfully", "success");
      } else {
        await axios.post(
          "https://trialtmbackend.vercel.app/add-student-review-data",
          formDataToSend
        );
        Swal.fire("Success", "Edit St Review successfully", "success");
      }
      fetchStudentReviewData();
      closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this student review? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(
          `https://trialtmbackend.vercel.app/delete-student-review-data/${id}`
        );
        Swal.fire(
          "Deleted!",
          "The student review has been deleted.",
          "success"
        );
        fetchStudentReviewData();
      }
    } catch (err) {
      console.error("Error deleting data:", err);
      Swal.fire(
        "Error!",
        "There was an error deleting the student review.",
        "error"
      );
    }
  };
  const openEditModal = (data) => {
    setFormData({
      category: data.category,
      studentName: data.studentName,
      profilePic: null,
      jobRole: data.jobRole,
      companyName: data.companyName,
      review: data.review,
      importantPoints: data.importantPoints,
    });
    setIsEdit(true);
    setEditId(data._id);
    openModal();
  };
  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-4 bg-gray-100 text-black">
          <div className="flex justify-between mb-2">
            <h1 className="text-2xl font-bold mb-4">Student Reviews CMS</h1>
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
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              onClick={openModal}
            >
              <FaPlus />
            </button>
          </div>
          <table className="min-w-full bg-white text-black">
            <thead className="bg-gray-800 text-white">
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 ">Category</th>
                <th className="py-2 px-4 ">Student Name</th>
                <th className="py-2 px-4 ">Profile</th>
                <th className="py-2 px-4 ">Job Role</th>
                <th className="py-2 px-4 ">Company Name</th>
                <th className="py-2 px-4 ">Review</th>
                <th className="py-2 px-4 ">Important Points</th>
                <th className="py-2 px-4 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((data) => (
                <tr
                  key={data._id}
                  className="border-b border-gray-200 text-center"
                >
                  <td className="py-2 px-4 ">{data.category}</td>
                  <td className="py-2 px-4 ">{data.studentName}</td>
                  <td className="py-2 px-4 flex justify-center">
                    <Image
                      src={data.profilePic}
                      alt="profile"
                      width={500}
                      height={500}
                    />
                  </td>
                  <td className="py-2 px-4 ">{data.jobRole}</td>
                  <td className="py-2 px-4 ">{data.companyName}</td>
                  <td className="py-2 px-4 ">{data.review}</td>
                  <td className="py-2 px-4 ">{data.importantPoints}</td>
                  <td className="py-2 px-4 ">
                    <button
                      className="text-green-500 hover:text-green-700 mr-4"
                      onClick={() => openEditModal(data)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(data._id)}
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
            contentLabel="Student Review Modal"
            className="modal w-[50%] text-black"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Student Review" : "Add New Student Review"}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category} // Ensure the selected category is shown
                  className="block w-full p-2 border mb-4"
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  {courseCategories &&
                    courseCategories.map((data) => (
                      <option
                        key={data.courseCategory}
                        value={data.courseCategory}
                      >
                        {data.courseCategory}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  name="profilePic"
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  accept="image/*"
                  ref={imagePreviewRef} // Add ref for clearing file input field
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Profile Preview"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Job Role</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Review</label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Important Points (comma-separated)
                </label>
                <input
                  type="text"
                  name="importantPoints"
                  value={formData.importantPoints}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="flex justify-end ps-3">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {isEdit ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded ms-3"
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
export default StudentReviewCMS;
