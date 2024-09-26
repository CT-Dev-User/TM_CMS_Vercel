"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button, Modal, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { useParams, useRouter } from "next/navigation";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/app/contextApi/UserContext";
const ToolsCoveredTable = () => {
  const { category } = useParams();
  const fileInputRef = useRef(null); // Ref for the file input
  const imagePreviewRef = useRef(null);
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [toolsCovered, setToolsCovered] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    ToolsCoveredicon: "", // This will now be a file object
    ToolsCoveredtitle: "",
  });
  const [iconPreview, setIconPreview] = useState(""); // For displaying image preview

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push('/'); // Redirect to login page if not authenticated
    } else {
      const fetchToolsCovered = async () => {
        try {
          const response = await axios.get(
            `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-by-category-tools-covered/${category}`
          );
          setToolsCovered(response.data);
        } catch (error) {
          console.error("Error fetching tools covered", error);
        }
      };
      fetchToolsCovered();
    }
  }, [userauth, router, category]);


  const handleEdit = (tool) => {
    setSelectedTool(tool);
    setFormData({
      category: tool.category,
      ToolsCoveredicon: "", // Reset file input for editing
      ToolsCoveredtitle: tool.ToolsCoveredtitle,
    });
    setIconPreview(tool.ToolsCoveredicon); // Set preview
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
            `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/delete-tools-covered/${id}`
          );
          fetchToolsCovered();
          Swal.fire("Deleted!", "The tool has been deleted.", "success");
        }
      });
    } catch (error) {
      console.error("Error deleting tool covered", error);
    }
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      data.append("category", category);
      data.append("ToolsCoveredtitle", formData.ToolsCoveredtitle);

      if (formData.ToolsCoveredicon) {
        data.append("ToolsCoveredicon", formData.ToolsCoveredicon); // Append file if available
      }

      if (selectedTool) {
        await axios.put(
          `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/update-tools-covered/${selectedTool._id}`,
          data
        );
      } else {
        await axios.post("https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/add-tools-covered", data);
      }
      fetchToolsCovered();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving tool covered", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, ToolsCoveredicon: file });
      setIconPreview(URL.createObjectURL(file)); // Preview the selected file
    }
  };

  const handleRemoveImage = () => {
    setIconPreview(null);
    setFormData({ ...formData, ToolsCoveredicon: null }); // Clear the image file state
    if (imagePreviewRef.current) {
      imagePreviewRef.current.src = ""; // Clear the preview image
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input field
    }
  };

  return (
    <div className="bg-gray-100 text-black">
      <div className="flex justify-between py-4 px-2 ">
        <h2 className="text-2xl font-semibold ">Tools Covered </h2>
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
              setSelectedTool(null);
              setFormData({
                category: "",
                ToolsCoveredicon: "", // Reset file input
                ToolsCoveredtitle: "",
              });
              setIconPreview(""); // Reset preview
              setShowModal(true);
            }}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <FaEdit />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto mt-3 ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 text-white ">
            <tr>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 ">Icon</th>
              <th className="px-6 py-3 ">Title</th>
              <th className="px-6 py-3 ">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 ">
            {toolsCovered.map((tool) => (
              <tr
                key={tool._id}
                className="hover:bg-gray-100 text-center border-b"
              >
                <td className="px-6 py-4">{tool.category}</td>
                <td className="px-6 py-4 flex justify-center">
                  <Image
                    src={tool.ToolsCoveredicon}
                    alt={tool.ToolsCoveredtitle}
                    width={48}
                    height={48}
                    className="object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4">{tool.ToolsCoveredtitle}</td>
                <td className="px-6 py-4 ">
                  <Button
                    onClick={() => handleEdit(tool)}
                    className="mr-4 text-green-500 hover:text-green-700"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    onClick={() => handleDelete(tool._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-auto p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-medium">
                {selectedTool ? "Edit Tool" : "Add New Tool"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Icon
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {iconPreview && (
                  <div className="mt-2 flex items-center">
                    <Image
                      ref={imagePreviewRef}
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
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.ToolsCoveredtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ToolsCoveredtitle: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsCoveredTable;
