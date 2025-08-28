"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "reactstrap";
import Modal from "react-modal";
import { FaTrash } from "react-icons/fa";
import "./page.css"; // Adjust the path as needed
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const ConsultingFormCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forms, setForms] = useState([]);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = forms.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(forms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchConsultingForms();
    }
  }, [userauth, router]);

  const fetchConsultingForms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/api/get-consulting-forms"
      );
      setForms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching consulting forms", error);
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
            `https://trialtmbackend.vercel.app/api/delete-consulting-form/${id}`
          );
          Swal.fire(
            "Deleted",
            "delete consulting data successfully.",
            "success"
          );
          fetchConsultingForms();
          setDeleteModalIsOpen(false);
        } catch (error) {
          Swal.fire("Error", "Error deleting data.", "error");
        }
      }
    });
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-4 text-black bg-gray-100">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Consulting Forms
          </h2>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white ">
                <tr className=" border-b">
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Phone Number</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {currentItems.map((form) => (
                  <tr key={form._id} className="text-center border-b">
                    <td className="py-2 px-4 ">{form.name}</td>
                    <td className="py-2 px-4 ">{form.email}</td>
                    <td className="py-2 px-4 ">{form.phoneNo}</td>
                    <td className="py-2 px-4 ">
                      <Button
                        color="danger"
                        onClick={() => {
                          setSelectedForm(form);
                          setDeleteModalIsOpen(true);
                        }}
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
            isOpen={deleteModalIsOpen}
            onRequestClose={() => setDeleteModalIsOpen(false)}
            contentLabel="Delete Consulting Form"
            className="modal text-black"
            overlayClassName="overlay"
          >
            <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this consulting form?</p>
            <div className="flex gap-2 mt-4">
              <Button
                color="danger"
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => handleDelete(selectedForm._id)}
              >
                Delete
              </Button>
              <Button
                color="secondary"
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setDeleteModalIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default ConsultingFormCMS;
