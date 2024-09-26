"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { FaEdit, FaEye, FaPlus, FaTrash } from "react-icons/fa";
import Modal from "react-modal";
import { Button } from "react-bootstrap";
import Swal from "sweetalert2";
import "./page.css";
import Image from "next/image";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const ExtensiveProgramTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([])
  const [courseCategories, setCourseCategories] = useState([]);

  // Popup states
  const [cardDataPop, setCardDataPop] = useState(false);
  const [headerDataPop, setHeaderDataPop] = useState(false);
  const [highlightPop, setHighlightPop] = useState(false);
  const [courseCurriculumPop, setCourseCurriculumPop] = useState(false);
  const [topInDemandToolsPop, setTopInDemandToolsPop] = useState(false);
  const [feesStructuresPop, setFeesStructuresPop] = useState(false);

  // Popup data
  const [cardData, setCardData] = useState({});
  const [headerData, setHeaderData] = useState({});
  const [highlightPopUpData, setHighlightPopUpData] = useState({});
  const [courseCurriculumPopUpData, setCourseCurriculumPopUpData] = useState(
    []
  );
  const [topInDemandToolsData, setTopInDemandToolsData] = useState({});
  const [feesStructuresPopUpData, setFeesStructuresPopUpData] = useState({});
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrograms.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchPrograms();
      fetchCourseCategories();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-extensive-program"
      );
      setPrograms(response.data);
      setFilteredPrograms(response.data)
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(programs);
    } else {
      setFilteredPrograms(programs.filter(category => category.Category === e.target.value));
    }
  };

  const handleDelete = async (id) => {
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
          await axios.delete(
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-extensive-program-by-id/${id}`
          );
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The program has been deleted.",
            confirmButtonText: "OK",
          }).then(() => {
            fetchPrograms();
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "There was an error deleting the program data.",
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
        <div className="container mx-auto p-4 bg-gray-100">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold mb-2 text-black">
              Extensive Programs
            </h2>
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
            <Link
              href="/dashboard/latestExtensiveProgram/extensiveProgramForm"
              className="bg-blue-500 text-white px-4 py-2 mb-2 rounded"
            >
              <FaPlus />
            </Link>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white border-b">
                <tr>
                  <th className="py-2 px-4 ">Category</th>
                  <th className="py-2 px-4 ">Card Data</th>
                  <th className="py-2 px-4 ">Header Data</th>
                  <th className="py-2 px-4 ">Highlights</th>
                  <th className="py-2 px-4 ">Course Curriculum</th>
                  <th className="py-2 px-4 ">Top In-Demand Tools</th>
                  <th className="py-2 px-4 ">Fees Structures</th>
                  <th className="py-2 px-4 ">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems &&
                  currentItems.map((program) => (
                    <tr key={program._id} className="text-center border-b">
                      <td className="py-2 px-4  text-black text-center">
                        {program.Category}
                      </td>
                      <td className="py-2 px-4  text-center ">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            setCardDataPop(true);
                            setCardData(program.cardData);
                          }}
                        >
                          <FaEye />
                        </button>
                      </td>
                      <td className="py-2 px-4 ">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            setHeaderDataPop(true);
                            setHeaderData(program.headerData);
                          }}
                        >
                          <FaEye />
                        </button>
                      </td>
                      <td className="py-2 px-4 ">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            setHighlightPop(true);
                            setHighlightPopUpData(program.highlights);
                          }}
                        >
                          <FaEye />
                        </button>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            setCourseCurriculumPop(true);
                            setCourseCurriculumPopUpData(
                              program.courseCurriculam
                            );
                          }}
                        >
                          <FaEye />
                        </button>
                      </td>
                      <td className="py-2 px-4 ">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            setTopInDemandToolsPop(true);
                            setTopInDemandToolsData(program.topInDemandTools);
                          }}
                        >
                          <FaEye />
                        </button>
                      </td>
                      <td className="py-2 px-4 ">
                        <button
                          className="text-blue-500"
                          onClick={() => {
                            setFeesStructuresPop(true);
                            setFeesStructuresPopUpData(program.FeesStuctures);
                          }}
                        >
                          <FaEye />
                        </button>
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        <Link
                          href={`/dashboard/latestExtensiveProgram/editProgram/${program._id}`}
                          className="text-green-500 hover:text-green-700 mr-4"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(program._id)}
                        >
                          <FaTrash />
                        </button>
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
          {/* Card Data Modal */}
          <Modal
            isOpen={cardDataPop}
            onRequestClose={() => setCardDataPop(false)}
            className="modal w-[30%]"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">Card Data</h2>
              <div className="space-y-4">
                <p>
                  <span className="font-bold">Program name:</span>{" "}
                  {cardData.programName}
                </p>
                <p>
                  <span className="font-bold">Duration:</span>{" "}
                  {cardData.programDuration}
                </p>
                <p>
                  <span className="font-bold">Program Status:</span>{" "}
                  {cardData.programstatus}
                </p>
                <p>
                  <span className="font-bold">Mode Of Class:</span>{" "}
                  {cardData.modeOfClass}
                </p>
                <p>
                  <span className="font-bold">Skills:</span>{" "}
                  {cardData.skillsYouDeveloped}
                </p>
                <p>
                  <span className="font-bold">Tools:</span>{" "}
                  {cardData.toolsToBeComplete}
                </p>
                <p>
                  <span className="font-bold">bgGradientColor:</span>{" "}
                  {cardData.bgGradientColor}
                </p>
              </div>
              <Button
                onClick={() => setCardDataPop(false)}
                className="bg-gray-500 text-white py-1 px-2 rounded mt-3"
              >
                Close
              </Button>
            </div>
          </Modal>

          {/* Header Data Modal */}
          <Modal
            isOpen={headerDataPop}
            onRequestClose={() => setHeaderDataPop(false)}
            className="modal w-[30%]"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Header Data
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="font-bold">Title:</span>
                  <h4
                    dangerouslySetInnerHTML={{ __html: headerData.headerTitle }}
                  />
                </div>
                <div>
                  <span className="font-bold">Subtitle:</span>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: headerData.headerSubTitle,
                    }}
                  />
                </div>
                <Image
                  src={headerData.headerBgImage}
                  alt={headerData.headerTitle}
                  width={200} // 100 pixels
                  height={200} // 100 pixels
                  className="object-cover"
                />
              </div>
              <Button
                onClick={() => setHeaderDataPop(false)}
                className="bg-gray-500 text-white py-1 mt-2 px-2 rounded"
              >
                Close
              </Button>
            </div>
          </Modal>

          {/* Highlights Modal */}
          <Modal
            isOpen={highlightPop}
            onRequestClose={() => setHighlightPop(false)}
            className="modal w-[30%]"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Highlights
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">
                    <span className="font-bold">Title:</span>{" "}
                    {highlightPopUpData.title}
                  </h4>
                  <p>
                    <span className="font-bold">Subtitle:</span>{" "}
                    {highlightPopUpData.subTitle}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Highlight Points:</h4>
                  {highlightPopUpData.highlightPoints &&
                    Array.isArray(highlightPopUpData.highlightPoints) ? (
                    highlightPopUpData.highlightPoints.map((point, index) => (
                      <div
                        key={point._id}
                        className="flex items-center space-x-2"
                      >
                        <Image
                          src={point.icon}
                          alt="Highlight Icon"
                          width={100} // 6 * 4 = 24 pixels
                          height={100}
                          className="mt-1" // Apply margin-top using a wrapper if needed
                        />
                        <span>{point.point}</span>
                      </div>
                    ))
                  ) : (
                    <p>No highlight points available</p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setHighlightPop(false)}
                className="bg-gray-500 text-white py-1 px-2 rounded"
              >
                Close
              </Button>
            </div>
          </Modal>

          {/* Course Curriculum Modal */}
          <Modal
            isOpen={courseCurriculumPop}
            onRequestClose={() => setCourseCurriculumPop(false)}
            className="modal w-[30%]"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {courseCurriculumPopUpData.map((curriculum, index) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <span className="font-bold">
                      {index + 1}. {curriculum.heading}
                    </span>

                    <ul className="list-disc pl-5">
                      <h4 className="font-semibold"> Topics </h4>
                      {curriculum.topic && Array.isArray(curriculum.topic) ? (
                        curriculum.topic.map((topic, topicIndex) => (
                          <div key={topicIndex}>
                            <li>
                              {" "}
                              {topicIndex + 1} {topic}
                            </li>
                          </div>
                        ))
                      ) : (
                        <li>No topics available</li>
                      )}
                    </ul>
                    <ul className="list-disc pl-5">
                      <h4 className="font-semibold"> keyTakeways </h4>
                      {curriculum.keyTakeways &&
                        Array.isArray(curriculum.keyTakeways) ? (
                        curriculum.keyTakeways.map((key, index) => (
                          <div key={index}>
                            <li>
                              {index + 1}. {key}
                            </li>
                          </div>
                        ))
                      ) : (
                        <li>No topics available</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setCourseCurriculumPop(false)}
                className="bg-gray-500 text-white py-1 px-2 rounded"
              >
                Close
              </Button>
            </div>
          </Modal>

          {/* Top In-Demand Tools Modal */}
          <Modal
            isOpen={topInDemandToolsPop}
            onRequestClose={() => setTopInDemandToolsPop(false)}
            className="modal w-[30%]"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Top In-Demand Tools
              </h2>
              <div className="space-y-4">
                {topInDemandToolsData && Array.isArray(topInDemandToolsData) ? (
                  topInDemandToolsData.map((tool, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Image
                        src={tool.logo}
                        alt="Tool Icon"
                        width={24} // 6 * 4 = 24 pixels
                        height={24}
                        className="mt-1" // Apply margin-top using a wrapper if needed
                      />
                      <span>{tool.toolsName}</span>
                    </div>
                  ))
                ) : (
                  <p>No tools available</p>
                )}
              </div>
              <Button
                onClick={() => setTopInDemandToolsPop(false)}
                className="bg-gray-500 text-white py-1 px-2 rounded"
              >
                Close
              </Button>
            </div>
          </Modal>

          {/* Fees Structures Modal */}
          <Modal
            isOpen={feesStructuresPop}
            onRequestClose={() => setFeesStructuresPop(false)}
            className="modal w-[40%]"
            overlayClassName="overlay"
          >
            <div className="modal-content text-black">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Fees Structures
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold">On Time Payment:</h4>
                  <p>
                    <span className="font-bold">Discount:</span>{" "}
                    {feesStructuresPopUpData?.onTimePayment?.discount}
                  </p>
                  <p>
                    <span className="font-bold">Original Fees:</span>{" "}
                    {feesStructuresPopUpData?.onTimePayment?.originalFees}
                  </p>
                  <p>
                    <span className="font-bold">Duration:</span>{" "}
                    {feesStructuresPopUpData?.onTimePayment?.duration}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Monthly Payment:</h4>
                  <p>
                    <span className="font-bold">Discount:</span>{" "}
                    {feesStructuresPopUpData?.MonthlyPayment?.discount}
                  </p>
                  <p>
                    <span className="font-bold">Original Fees:</span>{" "}
                    {feesStructuresPopUpData?.MonthlyPayment?.originalFees}
                  </p>
                  <p>
                    <span className="font-bold">Duration:</span>{" "}
                    {feesStructuresPopUpData?.MonthlyPayment?.duration}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">Scholarship:</h4>
                  <p>
                    <span className="font-bold">Discount:</span>{" "}
                    {feesStructuresPopUpData?.scollerShip?.discount}
                  </p>
                  <p>
                    <span className="font-bold">Original Fees:</span>{" "}
                    {feesStructuresPopUpData?.scollerShip?.originalFees}
                  </p>
                  <p>
                    <span className="font-bold">Duration:</span>{" "}
                    {feesStructuresPopUpData?.scollerShip?.duration}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setFeesStructuresPop(false)}
                className="bg-gray-500 text-white py-1 px-2 rounded"
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

export default ExtensiveProgramTable;
