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

const OurPartenerTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partners, setPartners] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = partners.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(partners.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchPartners();
    }
  }, [userauth, router]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-all-our-partner-data"
      );
      setPartners(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("companyName", companyName);
      data.append("companyLogo", companyLogo);
      if (editMode) {
        await axios.put(
          `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/edit-our-partner-data/${editId}`,
          data
        );
        Swal.fire("Success", "Partner data updated successfully", "success");
        setEditMode(false);
        setEditId(null);
      } else {
        await axios.post("https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/add-our-partner-data", data);
        Swal.fire("Success", "Partner data added successfully", "success");
      }
      fetchPartners();
      setShowPopup(false);
      setCompanyName("");
      setCompanyLogo(null);
    } catch (error) {
      console.error("Error adding/editing partner:", error);
      Swal.fire(
        "Error",
        "Error adding/editing partner. Please try again.",
        "error"
      );
    }
  };

  const handleEditPartnerData = (partner) => {
    setCompanyName(partner.companyName);
    setCompanyLogo(null); // Cannot set file input value
    setEditMode(true);
    setEditId(partner._id);
    setShowPopup(true);
  };

  const handleRemovePartnerData = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this partner? This action cannot be undone.",
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
            `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/delete-our-partner-data/${id}`
          );
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The partner has been deleted.",
            confirmButtonText: "OK",
          }).then(() => {
            fetchPartners();
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "There was an error deleting the partner data.",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogo(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    setLogoPreview(null);

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
        <div className="p-6 text-black bg-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold ">Our Partners</h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
              onClick={() => setShowPopup(true)}
            >
              <FaPlus />
            </button>
          </div>
          <table className="min-w-full bg-white border border-gray-200 text-black">
            <thead className="border-b">
              <tr>
                <th className="py-2 px-4 ">Company Name</th>
                <th className="py-2 px-4 ">Company Logo</th>
                <th className="py-2 px-4 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((partner) => (
                <tr key={partner._id} className="text-center border-b">
                  <td className="py-2 px-4 ">{partner.companyName}</td>
                  <td className="py-2 px-4 flex justify-center">
                    <Image
                      src={partner.companyLogo}
                      alt={partner.companyName}
                      width={64} // 16 * 4 = 64 pixels
                      height={64}
                      className="object-cover"
                    />
                  </td>
                  <td className="py-2 px-4 ">
                    <button
                      className="text-green-500 hover:text-green-700 mr-4"
                      onClick={() => handleEditPartnerData(partner)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemovePartnerData(partner._id)}
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

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl mb-4">
                  {editMode ? "Edit Partner" : "Add Partner"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Company Logo</label>
                    <input
                      type="file"
                      name="companyLogo"
                      onChange={handleLogoChange}
                      ref={fileInputRef}
                      className="w-full p-2 border rounded"
                      accept="image/*"
                    />
                    {logoPreview && (
                      <div className="mt-2">
                        <Image
                          src={logoPreview}
                          alt="Company Logo Preview"
                          width={96} // 24 * 4 = 96 pixels
                          height={96}
                          className="object-cover mt-2"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                        >
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                      onClick={() => {
                        setShowPopup(false);
                        setEditMode(false);
                        setEditId(null);
                        setCompanyName("");
                        setCompanyLogo(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      {editMode ? "Save Changes" : "Add"}
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

export default OurPartenerTable;
