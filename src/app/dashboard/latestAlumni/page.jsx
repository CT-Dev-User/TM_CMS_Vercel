"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./page.css";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const OurAlumniCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategories, setCourseCategories] = useState([]);
  const [alumniData, setAlumniData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    studentName: "",
    profilePic: null,
    profilePicPreview: null, // New state for profile picture preview
    jobRole: "",
    companyName: "",
    companyCity: "",
    companyLogo: null,
    companyLogoPreview: null, // New state for company logo preview
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
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

  const profilePicInputRef = useRef(null);
  const companyLogoInputRef = useRef(null);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchAlumniData();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true); // Start loading spinner
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

  const fetchAlumniData = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get(
        "https://backend-neon-nu.vercel.app/get-all-our-alumni-data"
      );
      setAlumniData(response.data);
      setFilteredPrograms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alumni data:", error);
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
      profilePicPreview: null,
      jobRole: "",
      companyName: "",
      companyCity: "",
      companyLogo: null,
      companyLogoPreview: null,
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
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: file,
        [`${name}Preview`]: previewURL,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "profilePicPreview" && key !== "companyLogoPreview") {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (isEdit) {
        await axios.put(
          `https://backend-neon-nu.vercel.app/update-our-alumni-data/${editId}`,
          formDataToSend
        );
        Swal.fire("Success", "Edit alumni successfully", "success");
      } else {
        await axios.post(
          "https://backend-neon-nu.vercel.app/add-our-alumni-data",
          formDataToSend
        );
        Swal.fire("Success", "Add alumni successfully", "success");
      }
      fetchAlumniData();
      closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this alumni? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(
          `https://backend-neon-nu.vercel.app/delete-our-alumni-data/${id}`
        );
        Swal.fire("Deleted!", "The alumni has been deleted.", "success");
        fetchAlumniData();
      }
    } catch (err) {
      console.error("Error deleting data:", err);
      Swal.fire("Error!", "There was an error deleting the alumni.", "error");
    }
  };

  const openEditModal = (data) => {
    setFormData({
      category: data.category,
      studentName: data.studentName,
      profilePic: null,
      profilePicPreview: data.profilePicURL, // Assuming you have the URL in the data
      jobRole: data.jobRole,
      companyName: data.companyName,
      companyCity: data.companyCity,
      companyLogo: null,
      companyLogoPreview: data.companyLogoURL, // Assuming you have the URL in the data
    });
    setIsEdit(true);
    setEditId(data._id);
    openModal();
  };
  const handleRemoveImage = (name, ref) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: "", // Clear the file input value from state
      [`${name}Preview`]: null, // Clear the preview
    }));

    if (ref && ref.current) {
      ref.current.value = ""; // Clear the file input field
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(alumniData);
    } else {
      setFilteredPrograms(
        alumniData.filter((category) => category.category === e.target.value)
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
        <div className="container mx-auto p-4 text-black  bg-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-black">Our Alumni CMS</h1>
            <div className="flex items-center space-x-4">
              <select
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {courseCategories.map((category) => (
                  <option key={category._id} value={category.courseCategory}>
                    {category.courseCategory}
                  </option>
                ))}
              </select>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md flex items-center hover:bg-blue-700 transition-colors"
                onClick={openModal}
              >
                <FaPlus className="mr-2" />
                Add Alumni
              </button>
            </div>
          </div>

          <table className="min-w-full bg-white text-black">
            <thead className="bg-gray-800 text-white border-b border-gray-200">
              <tr>
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Student Name</th>
                <th className="py-2 px-4">Job Role</th>
                <th className="py-2 px-4">Company Name</th>
                <th className="py-2 px-4">Company City</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((data) => (
                <tr
                  key={data._id}
                  className="text-center  border-b border-gray-200"
                >
                  <td className="py-2 px-4 ">{data.category}</td>
                  <td className="py-2 px-4 ">{data.studentName}</td>
                  <td className="py-2 px-4 ">{data.jobRole}</td>
                  <td className="py-2 px-4 ">{data.companyName}</td>
                  <td className="py-2 px-4 ">{data.companyCity}</td>
                  <td className="py-2 px-4 ">
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
            contentLabel="Our Alumni Modal"
            className="modal w-[50%] text-black custom-scrollbar"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Alumni Data" : "Add New Alumni Data"}
            </h2>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded text-black"
                >
                  <option value="">Select Category</option>
                  {courseCategories.map((category) => (
                    <option key={category._id} value={category.courseCategory}>
                      {category.courseCategory}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Profile Picture</label>
                <input
                  type="file"
                  name="profilePic"
                  onChange={handleFileChange}
                  ref={profilePicInputRef}
                  className="w-full px-4 py-2 border rounded"
                  accept="image/*"
                />
                {formData.profilePicPreview && (
                  <div className="mt-2 flex items-center">
                    <Image
                      src={formData.profilePicPreview}
                      alt="Profile Preview"
                      width={128}
                      height={128}
                      className="object-cover rounded"
                    />
                    <button
                      type="button"
                      className="ml-4 text-red-500"
                      onClick={() =>
                        handleRemoveImage("profilePic", profilePicInputRef)
                      }
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Job Role</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  ref={companyLogoInputRef}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Company City</label>
                <input
                  type="text"
                  name="companyCity"
                  value={formData.companyCity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Company Logo</label>
                <input
                  type="file"
                  name="companyLogo"
                  onChange={handleFileChange}
                  ref={companyLogoInputRef}
                  className="w-full px-4 py-2 border rounded"
                  accept="image/*"
                />
                {formData.companyLogoPreview && (
                  <div className="mt-2 flex items-center">
                    <Image
                      src={formData.companyLogoPreview}
                      alt="Company Logo Preview"
                      width={128}
                      height={128}
                      className="object-cover rounded"
                    />
                    <button
                      type="button"
                      className="ml-4 text-red-500"
                      onClick={() =>
                        handleRemoveImage("companyLogo", companyLogoInputRef)
                      }
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {isEdit ? "Update Alumni" : "Add Alumni"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
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

export default OurAlumniCMS;
