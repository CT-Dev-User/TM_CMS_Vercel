"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./page.css";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from 'next/image';
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const PractitionersCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategories, setCourseCategories] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [filteredpractitioners, setfilteredpractitioners] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    mentorName: "",
    jobRole: "",
    companyName: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const profilePicInputRef = useRef(null);
  const companyLogoInputRef = useRef(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredpractitioners.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredpractitioners.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchPractitioners();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-coursecategory"
      );
      setCourseCategories(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPractitioners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-new-practioners-data"
      );
      setPractitioners(response.data);
      setfilteredpractitioners(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching practitioners:", error);
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setfilteredpractitioners(practitioners);
    } else {
      setfilteredpractitioners(practitioners.filter(category => category.category === e.target.value));
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      category: "",
      mentorName: "",
      jobRole: "",
      companyName: "",
    });
    setProfilePic(null);
    setCompanyLogo(null);
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
    if (files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        if (name === "profilePic") {
          setProfilePic(file);
          setProfilePicPreview(reader.result);
        } else if (name === "companyLogo") {
          setCompanyLogo(file);
          setCompanyLogoPreview(reader.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };
  const handleRemoveFile = (name) => {
    if (name === "profilePic") {
      setProfilePic(null);
      setProfilePicPreview(null);
      if (profilePicInputRef.current) {
        profilePicInputRef.current.value = "";
      }
    } else if (name === "companyLogo") {
      setCompanyLogo(null);
      setCompanyLogoPreview(null);
      if (companyLogoInputRef.current) {
        companyLogoInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("category", formData.category);
    data.append("mentorName", formData.mentorName);
    data.append("jobRole", formData.jobRole);
    data.append("companyName", formData.companyName);
    if (profilePic) data.append("profilePic", profilePic);
    if (companyLogo) data.append("companyLogo", companyLogo);

    try {
      if (isEdit) {
        await axios.put(
          `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/edit-new-practioners-data/${editId}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.post(
          "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-new-practioners-data",
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      fetchPractitioners();
      closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-new-practioners-data/${id}`
      );
      fetchPractitioners();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const openEditModal = (practitioner) => {
    setFormData({
      category: practitioner.category,
      mentorName: practitioner.mentorName,
      jobRole: practitioner.jobRole,
      companyName: practitioner.companyName,
    });
    setProfilePic(null);
    setCompanyLogo(null);
    setIsEdit(true);
    setEditId(practitioner._id);
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
            <h1 className="text-2xl font-bold mb-4">Practitioners CMS</h1>
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
                <th className="py-2 px-4 border-b border-gray-200">Category</th>
                <th className="py-2 px-4">Mentor Name</th>
                <th className="py-2 px-4 ">Profile Pic</th>
                <th className="py-2 px-4 ">Job Role</th>
                <th className="py-2 px-4 ">Company Name</th>
                <th className="py-2 px-4 ">Company Logo</th>
                <th className="py-2 px-4 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((practitioner) => (
                <tr
                  key={practitioner._id}
                  className=" text-center border-b border-gray-200"
                >
                  <td className="py-2 px-4 ">{practitioner.category}</td>
                  <td className="py-2 px-4 ">{practitioner.mentorName}</td>
                  <td className="py-2 px-4 ">
                    {practitioner.profilePic && (
                      <Image
                        src={practitioner.profilePic}
                        alt="Profile"
                        width={64} // 16 * 4 = 64 pixels
                        height={64}
                        className="object-cover"
                      />
                    )}
                  </td>
                  <td className="py-2 px-4 ">{practitioner.jobRole}</td>
                  <td className="py-2 px-4 ">{practitioner.companyName}</td>
                  <td className="py-2 px-4 flex justify-center">
                    {practitioner.companyLogo && (
                      <Image
                        src={practitioner.companyLogo}
                        alt="Company Logo"
                        width={64} // 16 * 4 = 64 pixels
                        height={64}
                        className="object-cover"
                      />
                    )}
                  </td>
                  <td className="py-2 px-4 ">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => openEditModal(practitioner)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(practitioner._id)}
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
            contentLabel="Practitioner Modal"
            className="modal w-[50%] text-black"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Practitioner" : "Add New Practitioner"}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                <label className="block text-gray-700 mb-2">Mentor Name</label>
                <input
                  type="text"
                  name="mentorName"
                  value={formData.mentorName}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Job Role</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
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
                  ref={profilePicInputRef}
                  className="border border-gray-300 rounded p-2 w-full"
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
                      onClick={() => handleRemoveFile("profilePic")}
                      className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                    >
                      Remove Profile Picture
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Company Logo</label>
                <input
                  type="file"
                  name="companyLogo"
                  onChange={handleFileChange}
                  ref={companyLogoInputRef}
                  className="border border-gray-300 rounded p-2 w-full"
                  accept="image/*"
                />
                {companyLogoPreview && (
                  <div className="mt-2">
                    <Image
                      src={companyLogoPreview}
                      alt="Company Logo Preview"
                      width={96} // 24 * 4 = 96 pixels
                      height={96}
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("companyLogo")}
                      className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                    >
                      Remove Company Logo
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {isEdit ? "Update Practitioner" : "Add Practitioner"}
              </button>
            </form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default PractitionersCMS;
