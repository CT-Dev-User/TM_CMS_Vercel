"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/app/contextApi/UserContext";
const TechnicalHighlightsTable = () => {
  const { category } = useParams();
  const fileInputRef = useRef(null); // Ref for file input field
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [technicalHighlights, setTechnicalHighlights] = useState([]);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    technicalHighLighticon: "", // This will be a URL after uploading
    technicalHighLighttitle: "",
  });
  const [iconPreview, setIconPreview] = useState(""); // For displaying image preview

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push('/'); // Redirect to login page if not authenticated
    } else {
      const fetchTechnicalHighlights = async () => {
        try {
          const response = await axios.get(
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-by-category-technical-highlights/category/${category}`
          );
          setTechnicalHighlights(response.data);
        } catch (error) {
          console.error("Error fetching technical highlights", error);
        }
      };
      fetchTechnicalHighlights();
    }
  }, [userauth, router, category]);

  const handleEdit = (highlight) => {
    setSelectedHighlight(highlight);
    setFormData({
      category: highlight.category,
      technicalHighLighticon: highlight.technicalHighLighticon,
      technicalHighLighttitle: highlight.technicalHighLighttitle,
    });
    setIconPreview(highlight.technicalHighLighticon); // Set preview
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-technical-highlights/${id}`
          );
          fetchTechnicalHighlights();
          Swal.fire("Deleted!", "The highlight has been deleted.", "success");
        }
      });
    } catch (error) {
      console.error("Error deleting technical highlight", error);
    }
  };

  const handleSave = async () => {
    try {
      const form = new FormData();
      form.append("category", category);
      form.append("technicalHighLighttitle", formData.technicalHighLighttitle);

      if (formData.technicalHighLighticon) {
        form.append("technicalHighlightIcon", formData.technicalHighLighticon); // Append file if available
      }

      if (selectedHighlight) {
        await axios.put(
          `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/update-technical-highlight/${selectedHighlight._id}`,
          form
        );
      } else {
        await axios.post(
          "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-technical-highlights",
          form
        );
      }
      fetchTechnicalHighlights();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving technical highlight", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, technicalHighLighticon: file });
      setIconPreview(URL.createObjectURL(file)); // Preview the selected file
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, technicalHighLighticon: "" }); // Clear the image file state
    setIconPreview(""); // Clear the preview image
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input field
    }
  };

  return (
    <div className="bg-gray-100 text-black">
      <div className="flex justify-between py-4 px-2   ">
        <h2 className="text-2xl font-semibold ">Technical Highlights</h2>
        <div>
          <button
            onClick={() => {
              router.push("/dashboard/latestHirefromUs");
            }}
            className="bg-[grey] mr-3 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() => {
              setSelectedHighlight(null);
              setFormData({
                category: "",
                technicalHighLighticon: "",
                technicalHighLighttitle: "",
              });
              setIconPreview(""); // Reset preview
              setShowModal(true);
            }}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-800 text-white ">
            <tr className="text-md font-medium uppercase tracking-wider">
              <th className="px-6 py-3 ">Category</th>
              <th className="px-6 py-3 ">Icon</th>
              <th className="px-6 py-3 ">Title</th>
              <th className="px-6 py-3 ">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {technicalHighlights.map((highlight) => (
              <tr
                key={highlight._id}
                className="hover:bg-gray-100 text-center border-b"
              >
                <td className="px-6 py-4 ">{category}</td>
                <td className="px-6 py-4 ">
                  <Image
                    src={highlight.technicalHighLighticon}
                    alt={highlight.technicalHighLighttitle}
                    width={48}
                    height={48}
                    className="object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 ">
                  {highlight.technicalHighLighttitle}
                </td>
                <td className="px-6 py-4 ">
                  <button
                    onClick={() => handleEdit(highlight)}
                    className="mr-4 text-green-500 hover:text-green-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(highlight._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Container */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 text-black ${showModal ? "block" : "hidden"
          }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 bg-black bg-opacity-50"></div>
        <div className="relative bg-white rounded-lg shadow-lg max-w-lg mx-auto w-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">
              {selectedHighlight ? "Edit Highlight" : "Add New Highlight"}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="p-6">
            <form>
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="icon"
                  className="block text-sm font-medium text-gray-700"
                >
                  Icon
                </label>
                <input
                  id="icon"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ref={fileInputRef}
                />
                {iconPreview && (
                  <div className="mt-2 flex items-center">
                    <Image
                      src={iconPreview}
                      alt="Icon preview"
                      width={48}
                      height={48}
                      className="object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="ml-4 bg-red-500 text-white font-bold py-1 px-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.technicalHighLighttitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      technicalHighLighttitle: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </form>
          </div>
          <div className="flex justify-end p-4 border-t">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalHighlightsTable;
