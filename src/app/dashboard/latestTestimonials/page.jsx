"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import "./page.css";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const TestimonialsTable = () => {
  const router = useRouter();
  const [courseCategories, setCourseCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    studentName: "",
    profilePic: "",
    position: "",
    review: "",
    reviewPoints: "",
    reviewVideo: null,
  });
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrograms.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const [userauth, setuserauth] = useAuth();
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories(); // Fetch course categories if authenticated
      fetchTestimonials();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/api/get-all-coursecategory"
      );
      setCourseCategories(response.data); // Update state with fetched data
    } catch (err) {
      console.error("Error fetching course categories:", err); // Log error for debugging
      setError("Error fetching data"); // Set error state if fetch fails
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const fetchTestimonials = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/api/get-all-testimonials"
      );
      setTestimonials(response.data);
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
      text: "Do you really want to delete this testimonial? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://trialtmbackend.vercel.app/api/delete-testimonials/${id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The testimonial has been deleted.",
            confirmButtonText: "OK",
          }).then(() => {
            fetchTestimonials();
          });
        } catch (err) {
          console.error("Error deleting data:", err);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "There was an error deleting the testimonial.",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const handleAddModalOpen = () => setAddModalOpen(true);
  const handleAddModalClose = () => setAddModalOpen(false);
  const handleEditModalOpen = (testimonial) => {
    setFormData({
      category: testimonial.category,
      studentName: testimonial.studentName,
      position: testimonial.position,
      review: testimonial.review,
      reviewPoints: testimonial.reviewPoints,
      reviewVideo: null,
    });
    setEditId(testimonial._id);
    setEditModalOpen(true);
  };
  const handleEditModalClose = () => setEditModalOpen(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [reviewVideoPreview, setReviewVideoPreview] = useState(null);

  const profilePicInputRef = useRef(null);
  const reviewVideoInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, files } = e.target;

    if (name === "reviewVideo" || name === "profilePic") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (name === "profilePic") {
            setProfilePicPreview(reader.result);
          } else if (name === "reviewVideo") {
            setReviewVideoPreview(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      const { value } = e.target;
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveProfilePic = () => {
    setFormData({ ...formData, profilePic: "" });
    setProfilePicPreview(null);
    if (profilePicInputRef.current) {
      profilePicInputRef.current.value = null;
    }
  };

  const handleRemoveReviewVideo = () => {
    setFormData({ ...formData, reviewVideo: null });
    setReviewVideoPreview(null);
    if (reviewVideoInputRef.current) {
      reviewVideoInputRef.current.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.post(
        "https://trialtmbackend.vercel.app/api/add-all-testimonials",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Testimonial has been added successfully.",
          confirmButtonText: "OK",
        }).then(() => {
          fetchTestimonials();
          handleAddModalClose();
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an error adding the testimonial.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.put(
        `https://trialtmbackend.vercel.app/api/edit-testimonials/${editId}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Testimonial has been updated successfully.",
        confirmButtonText: "OK",
      }).then(() => {
        fetchTestimonials();
        handleEditModalClose();
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an error updating the testimonial.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(testimonials);
    } else {
      setFilteredPrograms(
        testimonials.filter((category) => category.category === e.target.value)
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
          <div className="flex items-center justify-between mb-5 text-black">
            <h2 className="text-2xl font-semibold ">Testimonials</h2>
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
              <Button
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-md hover:bg-blue-700 transition-colors"
                onClick={handleAddModalOpen}
              >
                <FaPlus className="mr-2" />
                Add Testimonial
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white border-b">
                <tr>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Student Name</th>
                  <th className="py-2 px-4">Profile</th>
                  <th className="py-2 px-4">Position</th>
                  <th className="py-2 px-4">Review</th>
                  <th className="py-2 px-4">Review Points</th>
                  <th className="py-2 px-4">Review Video</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {currentItems.map((testimonial) => (
                  <tr key={testimonial._id} className="text-center border-b">
                    <td className="py-2 px-4 ">{testimonial.category}</td>
                    <td className="py-2 px-4 ">{testimonial.studentName}</td>
                    <td className="py-2 px-4 ">
                      <Image
                        src={testimonial.profilePic}
                        alt="profile"
                        width={40} // 10 * 4 = 40 pixels
                        height={40}
                        className="object-cover rounded-full" // Added rounded-full for circular images
                      />
                    </td>
                    <td className="py-2 px-4 ">{testimonial.position}</td>
                    <td className="py-2 px-4 ">{testimonial.review}</td>
                    <td className="py-2 px-4 ">{testimonial.reviewPoints}</td>
                    <td className="py-2 px-4 ">
                      {testimonial.reviewVideo && (
                        <a
                          href={testimonial.reviewVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Video
                        </a>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <Button
                        color="secondary"
                        onClick={() => handleEditModalOpen(testimonial)}
                        className="mr-4 text-green-500 hover:text-green-700"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        color="danger"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(testimonial._id)}
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

          {/* Add Testimonial Modal */}
          <Modal
            isOpen={addModalOpen}
            onRequestClose={handleAddModalClose}
            className="modal h-[80vh] overflow-y-auto"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Add Testimonial
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
                            <option key={index} value={data.courseCategory}>
                              {data.courseCategory}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Student Name:
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Position:</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Review:</label>
                    <textarea
                      name="review"
                      value={formData.review}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Review Points (comma separated):
                    </label>
                    <input
                      type="text"
                      name="reviewPoints"
                      value={formData.reviewPoints}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Review Video:
                    </label>
                    <input
                      type="file"
                      name="reviewVideo"
                      onChange={handleChange}
                      ref={reviewVideoInputRef}
                      className="w-full p-2 border rounded"
                    />
                    {reviewVideoPreview && (
                      <div className="mt-2">
                        <video
                          src={reviewVideoPreview}
                          controls
                          className="w-full h-auto"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveReviewVideo}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remove Video
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Profile:</label>
                    <input
                      type="file"
                      name="profilePic"
                      onChange={handleChange}
                      ref={profilePicInputRef}
                      className="w-full p-2 border rounded"
                    />
                    {profilePicPreview && (
                      <div className="mt-2">
                        <Image
                          src={profilePicPreview}
                          alt="Profile Preview"
                          width={128} // 32 * 4 = 128 pixels
                          height={128}
                          className="object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveProfilePic}
                          className="mt-2 text-red-500 hover:text-red-700"
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
                    Add Testimonial
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
                    className="bg-grey-500 text-black px-4 py-2 mb-10 rounded"
                    onClick={handleAddModalClose}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Modal>

          {/* Edit Testimonial Modal */}
          <Modal
            isOpen={editModalOpen}
            onRequestClose={handleEditModalClose}
            className="modal h-[80vh] overflow-y-auto"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Edit Testimonial
              </h2>
              <form onSubmit={handleEditSubmit} encType="multipart/form-data">
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
                            <option key={index} value={data.courseCategory}>
                              {data.courseCategory}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Student Name:
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Position:</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Review:</label>
                    <textarea
                      name="review"
                      value={formData.review}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Review Points (comma separated):
                    </label>
                    <input
                      type="text"
                      name="reviewPoints"
                      value={formData.reviewPoints}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">
                      Review Video:
                    </label>
                    <input
                      type="file"
                      name="reviewVideo"
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Profile:</label>
                    <input
                      type="file"
                      name="profilePic"
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    color="primary"
                    className="bg-blue-500 text-white px-4 py-2 mb-10 rounded"
                  >
                    Update Testimonial
                  </Button>
                  <Button
                    type="button"
                    color="secondary"
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

export default TestimonialsTable;
