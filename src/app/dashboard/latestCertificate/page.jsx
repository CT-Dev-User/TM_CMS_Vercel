"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Modal from "react-modal";
import "./page.css";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const CertificateCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null); // Ref for the file input
  const imagePreviewRef = useRef(null);
  const [courseCategories, setCourseCategories] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [filtrCertificates, setfiltrCertificates] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [certificateImage, setCertificateImage] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    rankDetails: [],
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtrCertificates.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(filtrCertificates.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchCertificates();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false); // Start loading spinner
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get("https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-certificate");
      setCertificates(response.data);
      setfiltrCertificates(response.data);
      setLoading(false); // Start loading spinner
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setfiltrCertificates(certificates);
    } else {
      setfiltrCertificates(certificates.filter(category => category.category === e.target.value));
    }
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      category: "",
      rankDetails: [],
    });
    setCertificateImage(null);
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

  const handleRankDetailsChange = (e, index) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedRankDetails = [...prevFormData.rankDetails];
      updatedRankDetails[index][name] = value;
      return { ...prevFormData, rankDetails: updatedRankDetails };
    });
  };

  const handleAddRankDetail = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rankDetails: [
        ...prevFormData.rankDetails,
        { rank: "", programName: "", rankGivenBy: "" },
      ],
    }));
  };

  const handleRemoveRankDetail = (index) => {
    setFormData((prevFormData) => {
      const updatedRankDetails = [...prevFormData.rankDetails];
      updatedRankDetails.splice(index, 1);
      return { ...prevFormData, rankDetails: updatedRankDetails };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("category", formData.category);
    formDataToSend.append("rankDetails", JSON.stringify(formData.rankDetails));
    if (certificateImage) {
      formDataToSend.append("certificateImage", certificateImage);
    }

    try {
      if (isEdit) {
        await axios.put(
          `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/edit-CertificateData-by-id/${editId}`,
          formDataToSend
        );
        Swal.fire("Success", "Edit Data Successfully", "success");
      } else {
        await axios.post(
          "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-certificate",
          formDataToSend
        );
        Swal.fire("Success", "Add Data successfully", "success");
      }
      fetchCertificates();
      closeModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error", "Error submitting form Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this certificate? This action cannot be undone.",
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
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-CertificateData-by-id/${id}`
          );
          Swal.fire("Success", "Certificate deleted successfully.", "success");
          fetchCertificates();
        } catch (error) {
          console.error("Error deleting data:", error);
          Swal.fire("Error", "Error deleting data. Please try again.", "error");
        }
      }
    });
  };

  const openEditModal = (certificate) => {
    setFormData({
      category: certificate.category,
      rankDetails: certificate.rankDetails,
    });
    setCertificateImage(null);
    setIsEdit(true);
    setEditId(certificate._id);
    openModal();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificateImage(file);
        if (imagePreviewRef.current) {
          imagePreviewRef.current.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCertificateImage(null); // Clear the image file state
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
          <div className="flex justify-between mb-2">
            <h1 className="text-2xl font-bold mb-4">Certificate CMS</h1>
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
              className="bg-blue-500  px-4 py-2 rounded mb-4"
              onClick={openModal}
            >
              <FaPlus />
            </button>
          </div>
          <table className="min-w-full bg-white text-black">
            <thead className="bg-gray-800 text-white">
              <tr className="text-center">
                <th className="py-2 px-4">Category</th>
                <th className="py-2 px-4">Certificate Image</th>
                <th className="py-2 px-4">Rank Details</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((certificate) => (
                <tr
                  key={certificate._id}
                  className="text-center border-b border-gray-200"
                >
                  <td className="py-2 px-4 ">{certificate.category}</td>
                  <td className="py-2 px-4 flex justify-center">
                    {certificate.certificateImage && (
                      <Image
                        src={certificate.certificateImage}
                        alt="Certificate"
                        width={64} // 16 * 4 = 64 pixels
                        height={64}
                        className="object-cover"
                      />
                    )}
                  </td>
                  <td className="py-2 px-4 ">
                    {certificate.rankDetails &&
                      certificate.rankDetails.map((detail, index) => (
                        <div key={index} className="mb-2">
                          <p>Rank: {detail.rank}</p>
                          <p>Program Name: {detail.programName}</p>
                          <p>Rank Given By: {detail.rankGivenBy}</p>
                        </div>
                      ))}
                  </td>
                  <td className="py-2 px-4 ">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => openEditModal(certificate)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(certificate._id)}
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
            contentLabel="Certificate modal"
            className="modal w-[50%] text-black"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Certificate" : "Add New Certificate"}
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
                <input
                  type="file"
                  name="certificateImage"
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded p-2 w-full"
                  ref={fileInputRef} // Attach the ref
                  accept="image/*"
                />
                {certificateImage && (
                  <div className="mt-2">
                    <Image
                      src={URL.createObjectURL(certificateImage)} // Create a URL for the image file
                      alt="Certificate Preview"
                      width={96} // 24 * 4 = 96 pixels
                      height={96}
                      className="object-cover"
                      ref={imagePreviewRef} // Attach the ref
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
                <label className="block text-gray-700 mb-2">Rank Details</label>
                {formData.rankDetails.map((detail, index) => (
                  <div key={index} className="mb-4">
                    <input
                      type="text"
                      name="rank"
                      value={detail.rank}
                      onChange={(e) => handleRankDetailsChange(e, index)}
                      placeholder="Rank"
                      className="border border-gray-300 rounded p-2 w-full mb-2"
                      required
                    />
                    <input
                      type="text"
                      name="programName"
                      value={detail.programName}
                      onChange={(e) => handleRankDetailsChange(e, index)}
                      placeholder="Program Name"
                      className="border border-gray-300 rounded p-2 w-full mb-2"
                      required
                    />
                    <input
                      type="text"
                      name="rankGivenBy"
                      value={detail.rankGivenBy}
                      onChange={(e) => handleRankDetailsChange(e, index)}
                      placeholder="Rank Given By"
                      className="border border-gray-300 rounded p-2 w-full mb-2"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRankDetail(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddRankDetail}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Add Rank Detail
                </button>
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
                  className="bg-grey ms-2"
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

export default CertificateCMS;
