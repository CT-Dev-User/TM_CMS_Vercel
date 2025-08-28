"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const InstructorManagementTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creators, setCreators] = useState([]);
  const [filteredcreators, setfilteredcreators] = useState([]);
  const [courseCategories, setCourseCategories] = useState([]);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const profilePicInputRef = useRef(null);

  const [editFormData, setEditFormData] = useState({
    category: "",
    instructorName: "",
    jobRole: "",
    exCompany: "",
    profilePic: null,
    id: "",
  });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredcreators.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredcreators.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchCreators();
    }
  }, [userauth, router]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/get-all-instructors"
      );
      setCreators(response.data);
      setfilteredcreators(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching creators:", err);
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setfilteredcreators(creators);
    } else {
      setfilteredcreators(creators.filter(category => category.category === e.target.value));
    }
  };

  const fetchCourseCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://trialtmbackend.vercel.app/delete-instructor-data/${id}`
          );
          fetchCreators();
          Swal.fire(
            "Success",
            "Instructor data deleted successfully",
            "success"
          );
        } catch (err) {
          console.error("Error deleting instructor data:", err);
          Swal.fire(
            "Error",
            "Error deleting instructor data. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const handleOpenFormPopup = (creator = null) => {
    if (creator) {
      setEditFormData({
        category: creator.category || "",
        instructorName: creator.instructorName || "",
        jobRole: creator.jobRole || "",
        exCompany: creator.exCompany || "",
        profilePic: null,
        id: creator._id,
      });
      setEditMode(true);
    } else {
      setEditFormData({
        category: "",
        instructorName: "",
        jobRole: "",
        exCompany: "",
        profilePic: null,
        id: "",
      });
      setEditMode(false);
    }
    setShowFormPopup(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditFormData((prevData) => ({
      ...prevData,
      profilePic: file,
    }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setEditFormData((prevData) => ({
      ...prevData,
      profilePic: null,
    }));
    setProfilePicPreview(null);
    if (profilePicInputRef.current) {
      profilePicInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("category", editFormData.category);
    formDataToSend.append("instructorName", editFormData.instructorName);
    formDataToSend.append("jobRole", editFormData.jobRole);
    formDataToSend.append("exCompany", editFormData.exCompany);
    if (editFormData.profilePic)
      formDataToSend.append("profilePic", editFormData.profilePic);

    try {
      if (editMode) {
        await axios.put(
          `https://trialtmbackend.vercel.app/edit-instructor/${editFormData.id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        Swal.fire("Success", "Creator data updated successfully", "success");
      } else {
        await axios.post(
          "https://trialtmbackend.vercel.app/add-instructor-data",
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        Swal.fire("Success", "Creator data added successfully", "success");
      }
      fetchCreators();
      setShowFormPopup(false);
    } catch (err) {
      console.error("Error adding/editing creator data:", err);
      Swal.fire(
        "Error",
        "Error adding/editing creator data. Please try again.",
        "error"
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
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mb-4 ">Instructors</h2>
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
              className="bg-blue-500 text-white px-4 py-2 mb-5 rounded flex items-center"
              onClick={() => handleOpenFormPopup()}
            >
              <FaPlus />
            </button>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white border-b">
                <tr>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Instructor Name</th>
                  <th className="py-2 px-4">Job Role</th>
                  <th className="py-2 px-4">Ex Company</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((creator) => (
                  <tr key={creator._id} className="text-center border-b">
                    <td className="py-2 px-4 ">{creator.category}</td>
                    <td className="py-2 px-4 ">{creator.instructorName}</td>
                    <td className="py-2 px-4 ">{creator.jobRole}</td>
                    <td className="py-2 px-4 ">{creator.exCompany}</td>
                    <td className="py-2 px-4 ">
                      <button
                        className="text-green-500 hover:text-green-700 mr-4"
                        onClick={() => handleOpenFormPopup(creator)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(creator._id)}
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

          {showFormPopup && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editMode ? "Edit Instructor" : "Add instructor"}
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    id=""
                    className="block w-full p-2 border mb-4"
                    onChange={handleInputChange}
                  >
                    <option value="">select category</option>
                    {courseCategories &&
                      courseCategories.map((data) => {
                        return (
                          <option value={data.courseCategory} key={data._id}>
                            {data.courseCategory}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={editFormData.instructorName}
                    onChange={handleInputChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Role
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    value={editFormData.jobRole}
                    onChange={handleInputChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Ex Company
                  </label>
                  <input
                    type="text"
                    name="exCompany"
                    value={editFormData.exCompany}
                    onChange={handleInputChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    name="profilePic"
                    onChange={handleFileChange}
                    ref={profilePicInputRef}
                    className="mt-1 block w-full text-sm text-gray-500"
                    accept="image/*"
                  />
                  {profilePicPreview && (
                    <div className="mt-2">
                      <Image
                        src={profilePicPreview}
                        alt="Profile Preview"
                        width={96} // 24 * 4 = 96 pixels
                        height={96}
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                      >
                        Remove Profile Picture
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                    onClick={() => setShowFormPopup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleFormSubmit}
                  >
                    {editMode ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default InstructorManagementTable;
