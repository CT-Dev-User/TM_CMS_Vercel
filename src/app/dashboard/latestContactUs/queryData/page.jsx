"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);
const QueryDataTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  const [selectedForm, setSelectedForm] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchData();
    }
  }, [userauth, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://backend-neon-nu.vercel.app/get-query-data");
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`https://backend-neon-nu.vercel.app/delete-query-data/${id}`);
        Swal.fire("Deleted!", "Your data has been deleted.", "success");
        fetchData(); // Refresh the table data after deletion
      } catch (error) {
        console.error("Error deleting data:", error);
        Swal.fire("Error!", "There was an error deleting the data.", "error");
      }
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto text-black bg-gray-100">
          <h1 className="text-2xl font-bold  px-8 py-2">Query Data</h1>
          <table className="min-w-full border border-gray-200  ">
            <thead className="bg-gray-800 text-white">
              <tr className=" border-b">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Phone No</th>
                <th className="py-2 px-4">Currently Pursuing</th>
                <th className="py-2 px-4">Work Experience (Years)</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-center  ">
              {data.map((query) => (
                <tr key={query._id} className="border-b text-center">
                  <td className="py-2 px-4">{query.name}</td>
                  <td className="py-2 px-4">{query.email}</td>
                  <td className="py-2 px-4">{query.phoneNo}</td>
                  <td className="py-2 px-4">{query.currentlyPursing}</td>
                  <td className="py-2 px-4">{query.WorkExperienceInYear}</td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded"
                      onClick={() => handleDelete(query._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4 space-x-4 pb-6">
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
        </div>

      )}
    </>
  );
};

export default QueryDataTable;
