"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { FaTrash } from "react-icons/fa";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import "./page.css"; // Adjust the path as needed

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const ContactUsCMS = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contactUsForms, setContactUsForms] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = contactUsForms.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(contactUsForms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchContactUsForms();
    }
  }, [userauth, router]);

  const fetchContactUsForms = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-new-contact-us-forms-data"
      );
      setContactUsForms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contact us forms", error);
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
            `https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/delete-new-contact-us-form/${id}`
          );
          Swal.fire("Deleted!", "Client entry has been deleted.", "success");
          fetchContactUsForms();
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
        <div className="container mx-auto p-4 bg-gray-100">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mb-4 text-black">
              Clients Data
            </h2>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white border-b">
                <tr>
                  <th className="py-2 px-4 ">Name</th>
                  <th className="py-2 px-4 ">Email</th>
                  <th className="py-2 px-4 ">Phone No</th>
                  <th className="py-2 px-4 ">Currently Pursuing</th>
                  <th className="py-2 px-4 ">Year</th>
                  <th className="py-2 px-4 ">Course Chosen with TM</th>
                  <th className="py-2 px-4 ">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {currentItems.map((form) => (
                  <tr key={form._id} className="text-center border-b">
                    <td className="py-2 px-4 ">{form.name}</td>
                    <td className="py-2 px-4 ">{form.email}</td>
                    <td className="py-2 px-4 ">{form.phoneNo}</td>
                    <td className="py-2 px-4 ">{form.currentlyPursing}</td>
                    <td className="py-2 px-4 ">{form.year}</td>
                    <td className="py-2 px-4 ">{form.courseChooseWithTM}</td>
                    <td className="py-2 px-4  ">
                      <Button
                        color="danger"
                        onClick={() => handleDelete(form._id)}
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
          {/* Add Contact Us Form Modal */}
        </div>
      )}
    </>
  );
};

export default ContactUsCMS;
