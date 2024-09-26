"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaEye, FaTrash, FaPlus, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { Button } from "reactstrap";
import "./page.css"; // Adjust the path as needed
import Swal from "sweetalert2";
import Modal from "react-modal";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const MasterClassCMS = () => {
  const [courseCategories, setCourseCategories] = useState([]);
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [masterClasses, setMasterClasses] = useState([]);
  const [filteredmasterClasses, setfilteredmasterClasses] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [masterClassRegisterLink, setmasterClassRegisterLink] = useState("");

  const [whatYouWillGainPopUp, setwhatYouWillGainPopUp] = useState(false);
  const [mentorDataPopUp, setMentorDataPopUp] = useState(false);
  const [masterClassForPop, setMasterClassForPopUp] = useState(false);

  const [whatYouWillGainData, setwhatYouWillGainData] = useState([]);
  const [mentorData, setMentorData] = useState("");
  const [masterClassForData, setMasterClassForData] = useState("");

  // State for cardData
  const [cardData, setCardData] = useState({
    masterClassTitle: "",
    masterClassSubTitle: "",
    startDate: "",
    endDate: "",
    time: "",
    venue: "",
    whatYouWillGain: [],
    mentorData: {
      mentorName: "",
      jobRole: "",
      company: "",
      companyLog: "",
      yearOfExperience: "",
      experiencePoint: "",
    },
    masterClassFor: {
      title: "",
      Icon: "",
    },
  });
  const [companyLogo, setCompanyLogo] = useState(null);
  const [masterClassIcon, setMasterClassIcon] = useState(null);
  const [mentorProfile, setmentorProfile] = useState(null);
  const [masterClassId, setMasterClassId] = useState(null);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchMasterClasses();
    }
  }, [userauth, router]);

  const handleEdit = (masterClass) => {
    setMasterClassId(masterClass._id);
    setCardData({
      masterClassTitle: masterClass.masterClassTitle || "",
      masterClassSubTitle: masterClass.masterClassSubTitle || "",
      startDate: masterClass.startDate || "",
      endDate: masterClass.endDate || "",
      time: masterClass.time || "",
      venue: masterClass.venue || "",
      whatYouWillGain: masterClass.whatYouWillGain || [],
      mentorData: {
        mentorName: masterClass.mentorData?.mentorName || "",
        jobRole: masterClass.mentorData?.jobRole || "",
        company: masterClass.mentorData?.company || "",
        companyLog: masterClass.mentorData?.companyLog || "",
        yearOfExperience: masterClass.mentorData?.yearOfExperience || "",
        experiencePoint: masterClass.mentorData?.experiencePoint || "",
      },
      masterClassFor: {
        title: masterClass.masterClassFor?.title || "",
        Icon: masterClass.masterClassFor?.Icon || "",
      },
    });

    setCompanyLogo(null);
    setMasterClassIcon(null);
    setmentorProfile(null);
    setModalIsOpen(true);
  };

  const handleAddWhatYouWillGain = () => {
    setCardData((prevState) => ({
      ...prevState,
      whatYouWillGain: [...prevState.whatYouWillGain, ""],
    }));
  };

  const handleRemoveWhatYouWillGain = (index) => {
    setCardData((prevState) => ({
      ...prevState,
      whatYouWillGain: prevState.whatYouWillGain.filter((_, i) => i !== index),
    }));
  };

  const handleChangeWhatYouWillGain = (index, value) => {
    const updatedWhatYouWillGain = cardData.whatYouWillGain.map((item, i) =>
      i === index ? value : item
    );
    setCardData((prevState) => ({
      ...prevState,
      whatYouWillGain: updatedWhatYouWillGain,
    }));
  };

  // Handlers to open/close modals
  const openWhatYouWillGainPopUp = () => setwhatYouWillGainPopUp(true);
  const closeWhatYouWillGainPopUp = () => setwhatYouWillGainPopUp(false);

  const openMentorDataPopUp = () => setMentorDataPopUp(true);
  const closeMentorDataPopUp = () => setMentorDataPopUp(false);

  const openMasterClassForPopUp = () => setMasterClassForPopUp(true);
  const closeMasterClassForPopUp = () => setMasterClassForPopUp(false);

  // Example data for demonstration purposes
  const exampleWhatYouWillGainData = ["Skill 1", "Skill 2", "Skill 3"];
  const exampleMentorData = {
    mentorName: "John Doe",
    jobRole: "Senior Developer",
    company: "Tech Corp",
  };
  const exampleMasterClassForData = {
    title: "Advanced React",
    icon: "path/to/icon.png",
  };

  // Use these examples to set state
  // In real use, set state from API or props
  useState(() => {
    setwhatYouWillGainData(exampleWhatYouWillGainData);
    setMentorData(exampleMentorData);
    setMasterClassForData(exampleMasterClassForData);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category", category);
    formData.append("masterClassRegisterLink", masterClassRegisterLink);
    formData.append("cardData", JSON.stringify(cardData));

    if (companyLogo) formData.append("companyLogo", companyLogo);
    if (masterClassIcon) formData.append("masterClassIcon", masterClassIcon);
    if (mentorProfile) formData.append("mentorProfile", mentorProfile);

    try {
      const url = masterClassId
        ? `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/edit-master-class/${masterClassId}`
        : "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/add-master-class-page";

      const method = masterClassId ? "PUT" : "POST";

      await axios({
        method: method,
        url: url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire(
        "Success",
        `Master class ${masterClassId ? "updated" : "added"} successfully!`,
        "success"
      );

      setModalIsOpen(false);
      setMasterClassId(null);
      fetchMasterClasses();
    } catch (error) {
      console.error("Error saving master class:", error);
      Swal.fire(
        "Error",
        "There was a problem saving the master class. Please try again.",
        "error"
      );
    }
  };

  const fetchCourseCategories = async () => {
    setLoading(true); // Start loading spinner
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

  const fetchMasterClasses = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await axios.get(
        "https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/get-master-classes"
      );
      setMasterClasses(response.data);
      setfilteredmasterClasses(response.data);
      setLoading(false); // Start loading spinner
    } catch (error) {
      console.error("Error fetching master classes", error);
    }
  };

  const handleDelete = async (id) => {
    // Show a confirmation popup before deletion
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
            `https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/delete-master-class-by-id/${id}`
          );
          Swal.fire("Deleted!", "Master class has been deleted.", "success");
          fetchMasterClasses();
        } catch (error) {
          console.error("Error deleting master class:", error);
          Swal.fire(
            "Error",
            "There was a problem deleting the master class. Please try again.",
            "error"
          );
        }
      }
    });
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredmasterClasses.slice(indexOfFirstItem, indexOfLastItem);

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredmasterClasses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setfilteredmasterClasses(masterClasses);
    } else {
      setfilteredmasterClasses(masterClasses.filter(category => category.category === e.target.value));
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-4 text-black bg-gray-100">
          <div className="flex justify-between mb-2">
            <h2 className="text-2xl font-semibold mb-2 text-black">
              Master Classes
            </h2>
            <select
              onChange={handleFilterChange}
              className="h-10 p-2 border border-gray-300 rounded text-black"
            >
              <option value="">All Categories</option>
              {courseCategories.map((category) => (
                <option key={category._id} value={category.courseCategory}>
                  {category.courseCategory}
                </option>
              ))}
            </select>
            {/* Pagination Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"
                  }`}
              >
                <FaArrowLeft />
              </button>

              <span className="px-2 py-1 text-lg font-semibold text-black">
                {currentPage}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"
                  }`}
              >
                <FaArrowRight />
              </button>
            </div>
            <Button
              color="primary"
              onClick={() => setModalIsOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
            >
              <FaPlus />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full  border border-gray-200 ">
              <thead className="bg-gray-800 text-white border-b">
                <tr>
                  <th className="py-2 px-4 ">Category</th>
                  <th className="py-2 px-4 ">Title</th>
                  <th className="py-2 px-4 ">Link</th>
                  <th className="py-2 px-4 ">Sub Title</th>
                  <th className="py-2 px-4 ">Date & Time</th>
                  <th className="py-2 px-4 ">Venue</th>
                  <th className="py-2 px-4 ">whatYouWillGain</th>
                  <th className="py-2 px-4 ">mentorData</th>
                  <th className="py-2 px-4 ">masterClassFor</th>
                  <th className="py-2 px-4 ">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {currentItems &&
                  currentItems.map((masterClass) => (
                    <tr key={masterClass._id} className="text-center border-b">
                      <td className="py-2 px-4 ">{masterClass.category}</td>
                      <td className="py-2 px-4 ">
                        {masterClass.cardData.masterClassTitle}
                      </td>
                      <td className="py-2 px-4 ">
                        {masterClass.masterClassRegisterLink && (
                          <a
                            href={masterClass.masterClassRegisterLink}
                            target="_blank"
                            className="text-[blue]"
                          >
                            Link
                          </a>
                        )}
                      </td>
                      <td className="py-2 px-4 ">
                        {masterClass.cardData.masterClassSubTitle}
                      </td>
                      <td className="py-2 px-4 ">
                        {masterClass.cardData.startDate} -{" "}
                        {masterClass.cardData.endDate}{" "}
                        {masterClass.cardData.time}
                      </td>
                      <td className="py-2 px-4 ">
                        {masterClass.cardData.venue}
                      </td>
                      <td className="py-2 px-4 ">
                        <FaEye
                          onClick={() => {
                            setwhatYouWillGainData(
                              masterClass.cardData.whatYouWillGain
                            );
                            setwhatYouWillGainPopUp(true);
                          }}
                        />
                        {/* {masterClass.cardData.whatYouWillGain} */}
                      </td>
                      <td className="py-2 px-4 ">
                        <FaEye
                          onClick={() => {
                            setMentorDataPopUp(true);
                            setMentorData(masterClass.cardData.mentorData);
                          }}
                        />
                        {/* {masterClass.cardData.mentorData} */}
                      </td>
                      <td className="py-2 px-4 ">
                        <FaEye
                          onClick={() => {
                            setMasterClassForPopUp(true);
                            setMasterClassForData(
                              masterClass.cardData.masterClassFor
                            );
                          }}
                        />
                        {/* {masterClass.cardData.masterClassFor} */}
                      </td>
                      <td className="py-2 px-4  ">
                        <Button
                          className="text-green-500 hover:text-green-700 mr-4"
                          onClick={() => handleEdit(masterClass)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(masterClass._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* What You Will Gain Pop-Up */}
          <Modal
            isOpen={whatYouWillGainPopUp}
            onRequestClose={closeWhatYouWillGainPopUp}
            className="modal text-black w-[30%]"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-semibold mb-4">What You Will Gain</h2>
            <ul>
              {whatYouWillGainData.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <Button
              onClick={closeWhatYouWillGainPopUp}
              className="bg-red-500 text-white px-3 py-2 mt-2"
            >
              Close
            </Button>
          </Modal>

          {/* Mentor Data Pop-Up */}
          <Modal
            isOpen={mentorDataPopUp}
            onRequestClose={closeMentorDataPopUp}
            className="modal text-black w-[30%]"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-semibold mb-4">Mentor Data</h2>
            <div className="text-black">
              <p>
                <strong>Name:</strong> {mentorData.mentorName}
              </p>
              <p>
                <strong>Job Role:</strong> {mentorData.jobRole}
              </p>
              <p>
                <strong>Company:</strong> {mentorData.company}
              </p>
              <p>
                <strong>companyLog:</strong>
                <Image
                  src={mentorData.companyLog}
                  alt={mentorData.company}
                  width={60} // 15 * 4 = 60 pixels
                  height={80} // 20 * 4 = 80 pixels
                  className="object-cover" // Apply additional styles if needed
                />
              </p>
              <p>
                <strong>yearOfExperience:</strong> {mentorData.yearOfExperience}
              </p>
              <p>
                <strong>experiencePoint:</strong> {mentorData.experiencePoint}
              </p>
              <p>
                <strong>mentorProfile:</strong>
                <Image
                  src={mentorData.mentorProfile}
                  alt={mentorData.mentorName}
                  width={60} // 15 * 4 = 60 pixels
                  height={80} // 20 * 4 = 80 pixels
                  className="object-cover" // Apply additional styles if needed
                />
              </p>
            </div>
            <Button
              onClick={closeMentorDataPopUp}
              className="bg-red-500 text-white px-3 py-2 mt-2"
            >
              Close
            </Button>
          </Modal>
          {/* Master Class For Pop-Up */}
          <Modal
            isOpen={masterClassForPop}
            onRequestClose={closeMasterClassForPopUp}
            className="modal text-black w-[30%]"
            overlayClassName="overlay"
          >
            <h2 className="text-xl font-semibold mb-4">Master Class For</h2>
            <div>
              <p>
                <strong>Title:</strong> {masterClassForData.title}
              </p>
              <p>
                <strong>Icon:</strong>
              </p>
              <Image
                src={masterClassForData.Icon}
                alt="Icon"
                width={64} // 16 * 4 = 64 pixels
                height={64}
                className="object-cover" // Apply additional styles if needed
              />
            </div>
            <Button
              onClick={closeMasterClassForPopUp}
              className="bg-red-500 text-white px-3 py-2 mt-2"
            >
              Close
            </Button>
          </Modal>
          {/* Add Master Class Modal */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => {
              setModalIsOpen(false);
              setMasterClassId(null);
            }}
            contentLabel="Add/Edit Master Class Modal"
            className="modal text-black w-[50%] custom-scrollbar"
            overlayClassName="overlay"
          >
            <h2 className="text-2xl font-semibold mb-4">
              {masterClassId ? "Edit Master Class" : "Add Master Class"}
            </h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1 text-black"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  name="category"
                  className="block w-full p-2 border mb-4"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="masterClassTitle"
                >
                  Master Class Title
                </label>
                <input
                  id="masterClassTitle"
                  name="masterClassTitle"
                  type="text"
                  value={cardData.masterClassTitle}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      masterClassTitle: e.target.value,
                    })
                  }
                  className="block w-full p-2 border mb-4"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="masterClassRegisterLink"
                >
                  Register Form Link
                </label>
                <input
                  id="masterClassRegisterLink"
                  name="masterClassRegisterLink"
                  type="text"
                  onChange={(e) => setmasterClassRegisterLink(e.target.value)}
                  className="block w-full p-2 border mb-4"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="masterClassSubTitle"
                >
                  Master Class Subtitle
                </label>
                <input
                  id="masterClassSubTitle"
                  name="masterClassSubTitle"
                  type="text"
                  value={cardData.masterClassSubTitle}
                  onChange={(e) =>
                    setCardData({
                      ...cardData,
                      masterClassSubTitle: e.target.value,
                    })
                  }
                  className="block w-full p-2 border mb-4"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="startDate"
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={cardData.startDate}
                  onChange={(e) =>
                    setCardData({ ...cardData, startDate: e.target.value })
                  }
                  className="block w-full p-2 border mb-4"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="endDate"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={cardData.endDate}
                  onChange={(e) =>
                    setCardData({ ...cardData, endDate: e.target.value })
                  }
                  className="block w-full p-2 border mb-4"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="time"
                >
                  Time
                </label>
                <input
                  id="time"
                  name="time"
                  type="text"
                  value={cardData.time}
                  onChange={(e) =>
                    setCardData({ ...cardData, time: e.target.value })
                  }
                  className="block w-full p-2 border mb-4"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="venue"
                >
                  Venue
                </label>
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  value={cardData.venue}
                  onChange={(e) =>
                    setCardData({ ...cardData, venue: e.target.value })
                  }
                  className="block w-full p-2 border mb-4"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="whatYouWillGain"
                >
                  What You Will Gain
                </label>
                {cardData.whatYouWillGain.map((gain, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={gain}
                      onChange={(e) =>
                        handleChangeWhatYouWillGain(index, e.target.value)
                      }
                      className="block w-full p-2 border mb-4"
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveWhatYouWillGain(index)}
                      className="ml-2 bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={handleAddWhatYouWillGain}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Add Another
                </Button>
              </div>

              <div>
                <h3>Add Mentor Data</h3>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="mentorName"
                  >
                    Mentor Name
                  </label>
                  <input
                    id="mentorName"
                    name="mentorName"
                    type="text"
                    value={cardData.mentorData.mentorName}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        mentorData: {
                          ...cardData.mentorData,
                          mentorName: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="jobrole"
                  >
                    Mentor JobRole
                  </label>
                  <input
                    id="jobrole"
                    name="jobrole"
                    type="text"
                    value={cardData.mentorData.jobRole}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        mentorData: {
                          ...cardData.mentorData,
                          jobRole: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="yearOfExperience"
                  >
                    YOE
                  </label>
                  <input
                    id="yearOfExperience"
                    name="yearOfExperience"
                    type="text"
                    value={cardData.mentorData.yearOfExperience}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        mentorData: {
                          ...cardData.mentorData,
                          yearOfExperience: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="company"
                  >
                    Company
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={cardData.mentorData.company}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        mentorData: {
                          ...cardData.mentorData,
                          company: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="companyLogo"
                  >
                    Company Logo
                  </label>
                  <input
                    id="companyLogo"
                    name="companyLogo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCompanyLogo(e.target.files[0])}
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="experiencePoint"
                  >
                    Experience Points (Comma-separated)
                  </label>
                  <input
                    id="experiencePoint"
                    name="experiencePoint"
                    type="text"
                    value={cardData.mentorData.experiencePoint}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        mentorData: {
                          ...cardData.mentorData,
                          experiencePoint: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="mentorProfile"
                  >
                    Mentor Profile
                  </label>
                  <input
                    id="mentorProfile"
                    name="mentorProfile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setmentorProfile(e.target.files[0])}
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <h1>Master Class For (comma separated)</h1>
                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="title"
                  >
                    Master Class For Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={cardData.masterClassFor.title}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        masterClassFor: {
                          ...cardData.masterClassFor,
                          title: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="masterClassIcon"
                  >
                    Master Class Icon
                  </label>
                  <input
                    id="masterClassIcon"
                    name="masterClassIcon"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMasterClassIcon(e.target.files[0])}
                    className="block w-full p-2 border mb-4"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setModalIsOpen(false);
                    setMasterClassId(null);
                  }}
                  className="mr-4 bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {masterClassId ? "Update Master Class" : "Add Master Class"}
                </button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </>
  );
};

export default MasterClassCMS;
