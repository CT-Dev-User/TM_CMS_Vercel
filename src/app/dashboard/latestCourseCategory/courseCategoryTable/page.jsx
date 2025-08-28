"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import Modal from "react-modal";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import "./page.css";
import { FaPlus } from "react-icons/fa";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const CourseCategoryTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategories, setCourseCategories] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Popup state
  const [headerPop, setHeaderPopUp] = useState(false);
  const [homeCardPop, setHomeCardPopUp] = useState(false);
  const [courseStatiticsPop, setCourseStatiticsPopUp] = useState(false);

  // Pop up data
  const [headerPopUpData, setHeaderPopUpData] = useState({});
  const [homeCardPopUpData, setHomeCardPopUpData] = useState({});
  const [CourseStatiticsPopUpData, setCourseStatiticsPopUpData] = useState({});

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to delete this course category? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(
          `https://trialtmbackend.vercel.app/delete-coursecategory-by-id/${id}`
        );
        Swal.fire(
          "Deleted!",
          "The course category has been deleted.",
          "success"
        );
        fetchCourseCategories();
      }
    } catch (err) {
      console.error("Error deleting data:", err);
      Swal.fire(
        "Error!",
        "There was an error deleting the course category.",
        "error"
      );
    }
  };

  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = courseCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Determine the total number of pages
  const totalPages = Math.ceil(courseCategories.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto bg-gray-100 p-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mb-2 text-black">
              Course Categories
            </h2>
            <Link
              href="/dashboard/latestCourseCategory/courseCategoryForm"
              className="bg-blue-500 text-white px-4 py-2 mb-2 rounded"
            >
              <FaPlus />
            </Link>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 border-b">Course Category</th>
                  <th className="py-2 px-4 border-b">Home Card</th>
                  <th className="py-2 px-4 border-b">Header Data</th>
                  <th className="py-2 px-4 border-b">Course Statistics</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((data) => (
                  <tr key={data._id} className="text-center">
                    <td className="py-2 px-4 border-b text-black text-center">
                      {data.courseCategory}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <button
                        className="text-blue-500"
                        onClick={() => {
                          setHomeCardPopUp(true);
                          setHomeCardPopUpData(data.homeCard);
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="text-blue-500"
                        onClick={() => {
                          setHeaderPopUp(true);
                          setHeaderPopUpData(data.headerData);
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="text-blue-500"
                        onClick={() => {
                          setCourseStatiticsPopUp(true);
                          setCourseStatiticsPopUpData(data.courseStatistics);
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="bg-red-500 text-white py-1 px-2 rounded"
                        onClick={() => handleDelete(data._id)}
                      >
                        Delete
                      </button>
                      <Link
                        href={`/dashboard/latestCourseCategory/editCourseCategory/${data._id}`}
                        className="bg-green-500 text-white py-1 px-2 rounded ml-2"
                      >
                        Edit
                      </Link>
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

          {/* Home Card Modal */}
          <Modal
            isOpen={homeCardPop}
            onRequestClose={() => setHomeCardPopUp(false)}
            className="modal"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">Home Card</h2>
              <div className="space-y-4">
                {/* Display the icon */}
                <div>
                  <h4 className="text-lg font-semibold">
                    <span className="font-bold">Icon:</span>
                  </h4>
                  <Image
                    src={homeCardPopUpData.icon}
                    alt="Home Card Icon"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                {/* Display points */}
                <div>
                  <h4 className="text-lg font-semibold">
                    <span className="font-bold">Points:</span>
                  </h4>
                  <ul className="list-disc pl-5">
                    {(homeCardPopUpData.points || []).map((point, index) => (
                      <li key={index} className="text-base">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button
                onClick={() => setHomeCardPopUp(false)}
                className="bg-gray-500 text-white py-1 px-2 rounded mt-2"
              >
                Close
              </Button>
            </div>
          </Modal>

          {/* Header Data Modal */}
          <Modal
            isOpen={headerPop}
            onRequestClose={() => setHeaderPopUp(false)}
            className="modal"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Header Data
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">
                    <span className="font-bold">Header Title:</span>{" "}
                    {headerPopUpData.headerTitle}
                  </h4>
                </div>
                <div>
                  <p className="text-base">
                    <span className="font-bold">Header Subtitle:</span>{" "}
                    {headerPopUpData.headerSubTitle}
                  </p>
                </div>
                <div>
                  <span className="block font-bold mb-1">Header bg Image:</span>
                  <Image
                    src={headerPopUpData.headerBgImage}
                    alt={headerPopUpData.headerTitle}
                    width={128} // 32 * 4 = 128 pixels
                    height={128}
                    className="object-cover rounded-md shadow-md"
                  />
                </div>
              </div>
              <Button
                onClick={() => setHeaderPopUp(false)}
                className="mt-2 bg-gray-500 text-white py-1 px-2 rounded"
              >
                Close
              </Button>
            </div>
          </Modal>

          {/* Course Statistics Modal */}
          <Modal
            isOpen={courseStatiticsPop}
            onRequestClose={() => setCourseStatiticsPopUp(false)}
            className="modal h-[70vh] custom-scrollbar overflow-y-auto"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Course Statistics
              </h2>
              <div className="space-y-4">
                {/* Display the Title */}
                <h4 className="text-lg font-semibold">
                  <span className="font-bold">Title:</span>{" "}
                  {CourseStatiticsPopUpData.Title}
                </h4>
                {/* Display data array items */}
                <h2 className="font-bold text-black">Card Data</h2>
                {CourseStatiticsPopUpData.data &&
                  CourseStatiticsPopUpData.data.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <p>
                        <span className="font-bold">Title:</span> {item.title}
                      </p>
                      <p>
                        <span className="font-bold">SubTitle:</span>{" "}
                        {item.subTitle}
                      </p>
                    </div>
                  ))}
              </div>
              <Button
                onClick={() => setCourseStatiticsPopUp(false)}
                className="mt-2 bg-gray-500 text-white py-1 px-2 rounded"
              >
                Close
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default CourseCategoryTable;
