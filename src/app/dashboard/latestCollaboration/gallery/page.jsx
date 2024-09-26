"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2"; // Import SweetAlert
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);
const GalleryManagement = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryData, setGalleryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [eventImage, setEventImage] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const category = ["Home", "College", "Company", "About"];
  const [formData, setFormData] = useState({
    category: "",
    eventName: "",
  });

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchGalleryData();
    }
  }, [userauth, router, currentPage]);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-galleries");
      setGalleryData(response.data);
      setFilteredPrograms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error fetching gallery data!",
      });
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-gallery-by-id/${id}`
          );
          fetchGalleryData();
          Swal.fire("Deleted!", "Gallery item has been deleted.", "success");
      } catch (error) {
  console.error("Detailed error:", error.response ? error.response.data : error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Error deleting gallery data!",
          });
        }
      }
    });
  };

  const handleEdit = (data) => {
    setEditData(data);
    setFormData({
      category: data.category,
      eventName: data.eventName,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setFormData({
      category: "",
      eventName: "",
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEventImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("category", formData.category);
    data.append("eventName", formData.eventName);
    if (eventImage) {
      data.append("eventImage", eventImage);
    }

    try {
      if (editData) {
        await axios.put(
          `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/edit-gallery-by-id/${editData._id}`,
          data
        );
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Gallery item has been updated.",
        });
      } else {
        await axios.post("https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-gallery", data);
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Gallery item has been added.",
        });
      }
      fetchGalleryData();
      setShowForm(false);
      setEventImage(null); // Reset file input after submit
} catch (error) {
  console.error("Detailed error:", error.response ? error.response.data : error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error submitting form!",
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEventImage(null); // Reset file input when closing form
  };

  const handleRemove = () => {
    setEventImage(null);
    setEventImagePreview(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

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

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(galleryData);
    } else {
      setFilteredPrograms(
        galleryData.filter((category) => category.category === e.target.value)
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
        <div className="container mx-auto mt-5 bg-gray-100">
          <div className="flex items-center text-black justify-between mb-4">
            <h2 className="text-2xl font-semibold ">
              Gallery Management
            </h2>
            <div className="flex items-center space-x-4">
              <select
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {category.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-md hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Item
              </button>
            </div>
          </div>

          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-2 px-4 border-b">Category</th>
                <th className="py-2 px-4 border-b">Event Name</th>
                <th className="py-2 px-4 border-b">Event Image</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="min-w-full bg-white border border-gray-200 text-black">
              {currentItems.map((item) => (
                <tr key={item._id} className="text-center border-b">
                  <td className="py-2 px-4">{item.category}</td>
                  <td className="py-2 px-4">{item.eventName}</td>
                  <td className="py-2 px-4 flex justify-center">
                    <Image
                      src={item.eventImage}
                      alt={item.eventName}
                      width={64} // 16 * 4 = 64 pixels
                      height={64}
                      className="object-cover"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-green-500 hover:text-green-700 mr-4"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700"
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
          {showForm && (
            <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-5 rounded shadow-lg text-black">
                <h2 className="text-xl mb-4">
                  {editData ? "Edit Gallery" : "Add Gallery"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="College">College</option>
                      <option value="Company">Company</option>
                      <option value="About">About</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Event Name</label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Event Image</label>
                    <input
                      type="file"
                      name="eventImage"
                      onChange={handleFileChange}
                      ref={fileInputRef} // Add ref here
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    {eventImagePreview && (
                      <div className="mt-2">
                        <Image
                          src={eventImagePreview}
                          alt="Preview"
                          width={128} // 32 * 4 = 128 pixels
                          height={128}
                          className="object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={handleRemove}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      {editData ? "Update" : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="mt-4">
      <ul className="flex justify-center">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`mx-1 px-2 py-1 border rounded ${
              currentPage === number
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500"
            }`}
          >
            <button onClick={() => paginate(number)}>{number}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default GalleryManagement;
