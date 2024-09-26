"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import "./page.css";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const SuccessStoriesTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();

  const [courseCategories, setCourseCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // for dropdown
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    storyDesc: "",
    points: "",
    profilePic: null,
  });
  const [editFormData, setEditFormData] = useState({
    category: "",
    name: "",
    storyDesc: "",
    points: "",
    profilePic: null,
    id: "",
  });
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
      fetchStories();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
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

  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-success-story-data"
      );
      setStories(response.data);
      setFilteredPrograms(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this faq? This action cannot be undone.",
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
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-success-story-data/${id}`
          );
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The story has been deleted.",
            confirmButtonText: "OK",
          }).then(() => {
            fetchStories();
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "There was an error deleting the story data.",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const handleAddModalOpen = () => setAddModalOpen(true);
  const handleAddModalClose = () => setAddModalOpen(false);

  const handleEditModalOpen = (story) => {
    setEditFormData({
      category: story.category,
      name: story.name,
      storyDesc: story.storyDesc,
      points: story.points,
      profilePic: null,
      id: story._id,
    });
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => setEditModalOpen(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null); // Add this for preview
  const [editProfilePicPreview, setEditProfilePicPreview] = useState(null); // Add this for edit preview
  const profilePicInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic" && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      setProfilePicPreview(URL.createObjectURL(files[0])); // Set preview image
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic" && files[0]) {
      setEditFormData({ ...editFormData, [name]: files[0] });
      setEditProfilePicPreview(URL.createObjectURL(files[0])); // Set edit preview image
    } else {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, profilePic: null });
    setProfilePicPreview(null);
    if (profilePicInputRef.current) {
      profilePicInputRef.current.value = "";
    }
  };

  const handleEditRemoveImage = () => {
    setEditFormData({ ...editFormData, profilePic: null });
    setEditProfilePicPreview(null);
    if (profilePicInputRef.current) {
      profilePicInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      await axios.post(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-success-story-data",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      Swal.fire("Success", "success story data added successfully", "success");
      fetchStories();
      handleAddModalClose();
      Swal.fire(
        "Success!",
        "The success story has been added successfully.",
        "success"
      );
    } catch (err) {
      console.error("Error adding success story:", err);
      Swal.fire(
        "Error!",
        "There was an error adding the success story.",
        "error"
      );
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in editFormData) {
      formDataToSend.append(key, editFormData[key]);
    }

    try {
      await axios.put(
        `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/edit-success-story-data/${editFormData.id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      Swal.fire("Success", "story data updated successfully", "success");
      fetchStories();
      handleEditModalClose();
      Swal.fire(
        "Success!",
        "The success story has been edited successfully.",
        "success"
      );
    } catch (err) {
      console.error("Error editing success story:", err);
      Swal.fire(
        "Error!",
        "There was an error editing the success story.",
        "error"
      );
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(stories);
    } else {
      setFilteredPrograms(
        stories.filter((category) => category.category === e.target.value)
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
        <div className="container mx-auto p-4 bg-gray-100">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mb-2 text-black">
              Success Stories
            </h2>
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
            <Button
              className="bg-blue-500 text-white px-4 py-2 mb-2 rounded"
              onClick={handleAddModalOpen}
            >
              <FaPlus />
            </Button>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white border-b">
                <tr>
                  <th className="py-2 px-4 ">Category</th>
                  <th className="py-2 px-4 ">Name</th>
                  <th className="py-2 px-4 ">Story Description</th>
                  <th className="py-2 px-4 ">Points</th>
                  <th className="py-2 px-4 ">Profile Picture</th>
                  <th className="py-2 px-4 ">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {currentItems.map((story) => (
                  <tr key={story._id} className="text-center border-b">
                    <td className="py-2 px-4 ">{story.category}</td>
                    <td className="py-2 px-4 ">{story.name}</td>
                    <td className="py-2 px-4 ">{story.storyDesc}</td>
                    <td className="py-2 px-4 ">{story.points}</td>
                    <td className="py-2 px-4 flex justify-center">
                      {story.profilePic && (
                        <Image
                          src={story.profilePic}
                          alt="Profile"
                          width={100} // 10 * 4 = 40 pixels
                          height={100}
                          className="rounded-full"
                        />
                      )}
                    </td>
                    <td className="py-2 px-4  ">
                      <Button
                        color="primary"
                        onClick={() => handleEditModalOpen(story)}
                        className="text-green-500 hover:text-green-700 mr-4"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        color="danger"
                        onClick={() => handleDelete(story._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </Button>
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

          {/* Add Success Story Modal */}
          <Modal
            isOpen={addModalOpen}
            onRequestClose={handleAddModalClose}
            className="modal w-[50%] mx-auto "
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Add Success Story
              </h2>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-1">Category:</label>
                    <select
                      name="category"
                      id=""
                      className="w-full p-2 border rounded"
                      onChange={handleChange}
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
                  <div>
                    <label className="block font-bold mb-1">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Story Description:
                    </label>
                    <textarea
                      name="storyDesc"
                      value={formData.storyDesc}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Points (comma separated):
                    </label>
                    <input
                      type="text"
                      name="points"
                      value={formData.points}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Profile Picture:
                    </label>
                    <input
                      type="file"
                      name="profilePic"
                      onChange={handleChange}
                      ref={profilePicInputRef}
                      className="w-full p-2 border rounded"
                    />
                    {profilePicPreview && (
                      <div>
                        <Image
                          src={profilePicPreview}
                          alt="Profile Preview"
                          width={80} // 20 * 4 = 80 pixels
                          height={80}
                          className="rounded-full"
                        />
                        <button
                          type="button"
                          color="danger"
                          className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                          onClick={handleRemoveImage}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    color="primary"
                    className="bg-blue-500 text-white px-4 py-2 mb-10 rounded"
                  >
                    Add Success Story
                  </Button>
                  <Button
                    className="bg-grey-500 text-black px-4 py-2 mb-10 rounded"
                    onClick={handleAddModalClose}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Edit Success Story Modal */}
          <Modal
            isOpen={editModalOpen}
            onRequestClose={handleEditModalClose}
            className="modal"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Edit Success Story
              </h2>
              <form onSubmit={handleEditSubmit} encType="multipart/form-data">
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-1">Category:</label>
                    <select
                      name="category"
                      value={editFormData.category}
                      className="w-full p-2 border rounded"
                      onChange={handleEditChange}
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
                  <div>
                    <label className="block font-bold mb-1">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Story Description:
                    </label>
                    <textarea
                      name="storyDesc"
                      value={editFormData.storyDesc}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Points (comma separated):
                    </label>
                    <input
                      type="text"
                      name="points"
                      value={editFormData.points}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Profile Picture:
                    </label>
                    <input
                      type="file"
                      name="profilePic"
                      onChange={handleEditChange}
                      ref={profilePicInputRef}
                      className="w-full p-2 border rounded"
                    />
                    {editProfilePicPreview && (
                      <div>
                        <Image
                          src={editProfilePicPreview}
                          alt="Profile Edit Preview"
                          width={80} // 20 * 4 = 80 pixels
                          height={80}
                          className="rounded-full"
                        />
                        <button
                          type="button"
                          color="danger"
                          className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                          onClick={handleEditRemoveImage}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    color="primary"
                    className="bg-blue-500 text-white px-4 py-2 mb-10 rounded"
                  >
                    Save Changes
                  </Button>
                  <Button
                    className="bg-grey-500 text-black px-4 py-2 mb-10 rounded"
                    onClick={handleEditModalClose}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default SuccessStoriesTable;
