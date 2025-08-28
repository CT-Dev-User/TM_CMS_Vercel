"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import "./page.css";
import { useRef } from "react";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);
const ContactUsCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const buildingImgInputRef = useRef(null);
  const [contactUsData, setContactUsData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    enquiryEmail: "",
    enquiryContactNo: "",
    forGrievanceEmail: "",
    forGrievanceContactNo: "",
    forCorporateEmail: "",
    forCorporateContactNo: "",
    buildingImg: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = contactUsData.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(contactUsData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchContactUsData();
    }
  }, [userauth, router]);

  const fetchContactUsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/api/get-new-contact-us-page-data"
      );
      setContactUsData(response.data);
      setLoading(false);
    } catch (error) {
      Swal.fire("Error", "Error fetching contact us data.", "error");
    }
  };

  const openModal = () => {
    setIsEdit(false);
    setFormData({
      address: "",
      enquiryEmail: "",
      enquiryContactNo: "",
      forGrievanceEmail: "",
      forGrievanceContactNo: "",
      forCorporateEmail: "",
      forCorporateContactNo: "",
      buildingImg: "",
    });
    setModalIsOpen(true);
  };

  const openEditModal = (data) => {
    setIsEdit(true);
    setEditId(data._id);
    setFormData({
      address: data.address,
      enquiryEmail: data.enquiry.email,
      enquiryContactNo: data.enquiry.contactNo,
      forGrievanceEmail: data.forGrievance.email,
      forGrievanceContactNo: data.forGrievance.contactNo,
      forCorporateEmail: data.ForCorporate.email,
      forCorporateContactNo: data.ForCorporate.contactNo,
      buildingImg: data.buildingImg,
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, buildingImg: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("address", formData.address);
    formDataToSend.append("enquiry[email]", formData.enquiryEmail);
    formDataToSend.append("enquiry[contactNo]", formData.enquiryContactNo);
    formDataToSend.append("forGrievance[email]", formData.forGrievanceEmail);
    formDataToSend.append(
      "forGrievance[contactNo]",
      formData.forGrievanceContactNo
    );
    formDataToSend.append("ForCorporate[email]", formData.forCorporateEmail);
    formDataToSend.append(
      "ForCorporate[contactNo]",
      formData.forCorporateContactNo
    );
    if (formData.buildingImg) {
      formDataToSend.append("buildingImg", formData.buildingImg);
    }

    try {
      if (isEdit) {
        await axios.put(
          `https://trialtmbackend.vercel.app/api/edit-new-contact-us-page-data/${editId}`,
          formDataToSend
        );
        Swal.fire(
          "Success",
          "Contact Us entry updated successfully!",
          "success"
        );
      } else {
        await axios.post(
          "https://trialtmbackend.vercel.app/api/add-new-contact-us-page-data",
          formDataToSend
        );
        Swal.fire("Success", "Contact Us entry added successfully!", "success");
      }
      fetchContactUsData();
      closeModal();
    } catch (error) {
      Swal.fire("Error", "Error submitting form.", "error");
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
            `https://trialtmbackend.vercel.app/api/delete-contact-us-page-data/${id}`
          );
          Swal.fire(
            "Deleted!",
            "Contact Us entry has been deleted.",
            "success"
          );
          fetchContactUsData();
        } catch (error) {
          Swal.fire("Error", "Error deleting data.", "error");
        }
      }
    });
  };

  const handleRemoveImage = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      buildingImg: "", // Clear the file input value from state
    }));
    setImagePreview(null);
    if (buildingImgInputRef.current) {
      buildingImgInputRef.current.value = ""; // Clear the file input field
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-4 bg-gray-100 text-black ">
          <div className="flex justify-between ">
            <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              onClick={openModal}
            >
              <FaPlus></FaPlus>
            </button>
          </div>
          <table className="min-w-full bg-white text-black">
            <thead className="bg-gray-800 text-white">
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4 ">Address</th>
                <th className="py-2 px-4 ">Email</th>
                <th className="py-2 px-4 ">Contact No</th>
                <th className="py-2 px-4 ">Building Image</th>
                <th className="py-2 px-4 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems &&
                currentItems.map((data) => (
                  <tr
                    key={data._id}
                    className="text-center border-b border-gray-200"
                  >
                    <td className="py-2 px-4 ">{data.address}</td>

                    <td className="py-2 px-4 ">
                      <p>
                        <span className="font-bold">Enquiry mail:-</span>
                        {data.enquiry && data.enquiry.email}
                      </p>
                      <p>
                        <span className="font-bold">Grievance Email:-</span>{" "}
                        {data.forGrievance && data.forGrievance.email}
                      </p>
                      <p>
                        <span className="font-bold">Corporate Email:-</span>
                        {data.ForCorporate && data.ForCorporate.email}
                      </p>
                    </td>
                    <td className="py-2 px-4 ">
                      <p>
                        <span className="font-bold">Enquiry:-</span>
                        {data.enquiry && data.enquiry.contactNo}
                      </p>
                      <p>
                        <span className="font-bold">Grievance:-</span>
                        {data.forGrievance && data.forGrievance.contactNo}
                      </p>
                      <p>
                        <span className="font-bold">Corporate:-</span>
                        {data.ForCorporate && data.ForCorporate.contactNo}
                      </p>
                    </td>
                    <td className="py-2 px-4 ">
                      {data.buildingImg && (
                        <Image
                          src={data.buildingImg}
                          alt="Building"
                          width={500}
                          height={500}
                          className="object-cover"
                        />
                      )}
                    </td>
                    <td className="py-2 px-4 ">
                      <button
                        className="text-green-500 hover:text-green-700 mr-4"
                        onClick={() => openEditModal(data)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(data._id)}
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
            className="modal text-black w-[50%]"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Edit Contact Us Entry" : "Add New Contact Us Entry"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">Enquiry Email</label>
                <input
                  type="email"
                  name="enquiryEmail"
                  value={formData.enquiryEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  Enquiry Contact No
                </label>
                <input
                  type="text"
                  name="enquiryContactNo"
                  value={formData.enquiryContactNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  For Grievance Email
                </label>
                <input
                  type="email"
                  name="forGrievanceEmail"
                  value={formData.forGrievanceEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  For Grievance Contact No
                </label>
                <input
                  type="text"
                  name="forGrievanceContactNo"
                  value={formData.forGrievanceContactNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  For Corporate Email
                </label>
                <input
                  type="email"
                  name="forCorporateEmail"
                  value={formData.forCorporateEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">
                  For Corporate Contact No
                </label>
                <input
                  type="text"
                  name="forCorporateContactNo"
                  value={formData.forCorporateContactNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700">Building Image</label>

                <input
                  type="file"
                  ref={buildingImgInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {imagePreview && (
                  <div>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="object-cover mt-2"
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
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {isEdit ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default ContactUsCMS;
