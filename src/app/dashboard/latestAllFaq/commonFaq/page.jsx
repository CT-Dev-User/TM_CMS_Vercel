"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const FaqTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = faqs.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(faqs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchFaqs();
    }
  }, [userauth, router]);

  const fetchFaqs = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get("https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-faq");
      setFaqs(response.data);
      setLoading(false); // Stop loading spinner
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const faqData = {
        question,
        answer,
      };
      if (editMode) {
        await axios.put(`https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/edit-faq/${editId}`, faqData);
        Swal.fire("Success", "FAQ data updated successfully", "success");
        setEditMode(false);
        setEditId(null);
      } else {
        await axios.post("https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-common-faq", faqData);
        Swal.fire("Success", "FAQ data added successfully", "success");
      }
      fetchFaqs();
      setShowPopup(false);
      setQuestion("");
      setAnswer("");
    } catch (error) {
      console.error("Error adding/editing FAQ:", error);
      Swal.fire(
        "Error",
        "Error adding/editing FAQ. Please try again.",
        "error"
      );
    }
  };

  const handleEditFaqData = (faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditMode(true);
    setEditId(faq._id);
    setShowPopup(true);
  };

  const handleRemoveFaqData = async (id) => {
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
          await axios.delete(`https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-faq/${id}`);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The FAQ has been deleted.",
            confirmButtonText: "OK",
          }).then(() => {
            fetchFaqs();
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "There was an error deleting the FAQ data.",
            confirmButtonText: "OK",
          });
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
        <div className="p-6 bg-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-black">FAQs</h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
              onClick={() => setShowPopup(true)}
            >
              <FaPlus />
            </button>
          </div>
          <table className="min-w-full bg-white border border-gray-200 text-black">
            <thead className="bg-gray-800 text-white border-b">
              <tr>
                <th className="py-2 px-4">Question</th>
                <th className="py-2 px-4">Answer</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((faq) => (
                <tr key={faq._id} className="text-center border-b">
                  <td className="py-2 px-4 ">{faq.question}</td>
                  <td className="py-2 px-4 ">{faq.answer}</td>
                  <td className="py-2 px-4 ">
                    <button
                      className="text-green-500 hover:text-green-700 mr-4"
                      onClick={() => handleEditFaqData(faq)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveFaqData(faq._id)}
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
                <h2 className="text-xl mb-4 ">
                  {editMode ? "Edit FAQ" : "Add FAQ"}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700">Question</label>
                    <input
                      type="text"
                      name="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full p-2 border rounded text-black"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Answer</label>
                    <textarea
                      name="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full p-2 border rounded text-black"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                      onClick={() => {
                        setShowPopup(false);
                        setEditMode(false);
                        setEditId(null);
                        setQuestion("");
                        setAnswer("");
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

export default FaqTable;
