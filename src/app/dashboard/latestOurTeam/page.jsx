"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./page.css"; // Ensure you have the necessary styles
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Image from "next/image";
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const TeamMemberCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const imagePreviewRef = useRef(null);
  const fileInputRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    memberName: "",
    position: "",
    profilePic: null,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = teamMembers.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(teamMembers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchTeamMembers();
    }
  }, [userauth, router]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-our-team-data"
      );
      setTeamMembers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      memberName: "",
      position: "",
      profilePic: null,
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevFormData) => ({
      ...prevFormData,
      profilePic: file,
    }));

    // Generate image preview URL
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("memberName", formData.memberName);
    formDataToSend.append("position", formData.position);
    if (formData.profilePic) {
      formDataToSend.append("profilePic", formData.profilePic);
    }

    try {
      if (isEdit) {
        await axios.put(
          `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/edit-our-team-data/${editId}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        Swal.fire("Success", "Team member updated successfully.", "success");
      } else {
        await axios.post(
          "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-our-team-data",
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        Swal.fire("Success", "Team member added successfully.", "success");
      }
      fetchTeamMembers();
      closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error", "Error submitting form. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this team member? This action cannot be undone.",
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
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-our-team-data/${id}`
          );
          Swal.fire("Success", "Team member deleted successfully.", "success");
          fetchTeamMembers();
        } catch (error) {
          console.error("Error deleting team member:", error);
          Swal.fire(
            "Error",
            "Error deleting team member. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const openEditModal = (member) => {
    setFormData({
      memberName: member.memberName,
      position: member.position,
      profilePic: null,
    });
    setIsEdit(true);
    setEditId(member._id);
    openModal();
  };

  const handleRemoveImage = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      profilePic: null,
    }));
    setImagePreview(null);
    if (imagePreviewRef.current) {
      imagePreviewRef.current.src = ""; // Clear the preview image
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input field
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
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4 ">Team Members</h1>
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
                <th className="py-2 px-4 ">Name</th>
                <th className="py-2 px-4 ">Position</th>
                <th className="py-2 px-4 ">Profile Picture</th>
                <th className="py-2 px-4 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((member) => (
                <tr
                  key={member._id}
                  className="text-center item-center  border-b border-gray-200"
                >
                  <td className="py-2 px-4 ">{member.memberName}</td>
                  <td className="py-2 px-4 ">{member.position}</td>
                  <td className="py-2 px-4 flex justify-center">
                    {member.profilePic && (
                      <Image
                        src={member.profilePic}
                        alt="Profile"
                        width={64} // 16 * 4 = 64 pixels
                        height={64}
                        className="object-cover"
                      />
                    )}
                  </td>
                  <td className="py-2 px-4 ">
                    <button
                      className="text-green-500 hover:text-green-700 mr-4"
                      onClick={() => openEditModal(member)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(member._id)}
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
            contentLabel="Team Member Modal"
            className="modal w-[50%] text-black"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Team Member" : "Add New Team Member"}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="memberName"
                  value={formData.memberName}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
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
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="border border-gray-300 rounded p-2 w-full"
                  accept="image/*"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Profile Preview"
                      width={96} // 24 * 4 = 96 pixels
                      height={96}
                      className="object-cover"
                      ref={imagePreviewRef} // Use the ref with an additional wrapper
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

              <div className="flex justify-end ps-3">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  {isEdit ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded ms-2"
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

export default TeamMemberCMS;
