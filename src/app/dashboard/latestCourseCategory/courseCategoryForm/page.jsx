'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/contextApi/UserContext";
import Swal from 'sweetalert2';
import Link from 'next/link';


const Spinner = () => (
  <div className="flex justify-center items-center">
      <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const AddCourseCategory = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [homeCardIcon, setHomeCardIcon] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [headerData, setHeaderData] = useState({
    headerTitle: "",
    headerSubTitle: "",
  });
  const [courseStatistics, setCourseStatistics] = useState({
    Title: "",
    data: [{ title: "", subTitle: "" }],
  });
  const [homeCardPoints, setHomeCardPoints] = useState([""]);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      setLoading(false);
    }
  }, [userauth, router]);

  const addStatisticField = () => {
    setCourseStatistics({
      ...courseStatistics,
      data: [...courseStatistics.data, { title: "", subTitle: "" }],
    });
  };

  const addPointField = () => {
    setHomeCardPoints([...homeCardPoints, ""]);
  };

  const handleInputChange = (e, section, index = null, subIndex, field) => {
    const { name, value, type, files } = e.target;
    if (section === "courseStatistics") {
      if (index !== null) {
        const updatedData = courseStatistics.data.map((item, i) =>
          i === index ? { ...item, [name]: value } : item
        );
        setCourseStatistics({ ...courseStatistics, data: updatedData });
      } else {
        setCourseStatistics({ ...courseStatistics, [name]: value });
      }
    } else if (section === "homeCardPoints") {
      const updatedPoints = homeCardPoints.map((point, i) =>
        i === index ? value : point
      );
      setHomeCardPoints(updatedPoints);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("courseCategory", courseCategory);
    formData.append("headerData", JSON.stringify(headerData));
    formData.append("courseStatistics", JSON.stringify(courseStatistics));
    formData.append(
      "homeCard",
      JSON.stringify({
        points: homeCardPoints,
      })
    );

    if (headerImage) {
      formData.append("headerImage", headerImage);
    }
    if (homeCardIcon) {
      formData.append("homeCardIcon", homeCardIcon);
    }

    try {
      const response = await axios.post(
        "https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/add-all-course-category",
        formData
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Course category has been added successfully.",
          confirmButtonText: "OK",
        }).then(() => {
          router.push("/dashboard/latestCourseCategory/courseCategoryTable");
        });
      }
    } catch (error) {
      console.error("Error adding course category:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an error adding the course category.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
          <h2 className="text-3xl font-semibold mb-6 text-center text-black">
            Add Course Category
          </h2>
          <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto">
            <div className="flex w-full justify-between">
              <div className="w-[48%]">
                {/* Course Category */}
                <div>
                  <label className="block text-lg font-medium text-black">
                    Course Category
                  </label>
                  <input
                    type="text"
                    name="courseCategory"
                    value={courseCategory}
                    onChange={(e) => {
                      setCourseCategory(e.target.value);
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Header Data */}
                <div className="w-full mt-4">
                  <h2 className="text-black text-[19px] font-semibold">
                    Header Data
                  </h2>
                  <div className="mt-2">
                    <label className="block text-lg font-medium text-black">
                      Header Title
                    </label>
                    <input
                      type="text"
                      name="headerTitle"
                      value={headerData.headerTitle}
                      onChange={(e) => {
                        setHeaderData({
                          ...headerData,
                          headerTitle: e.target.value,
                        });
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-lg font-medium text-black">
                      Header Subtitle
                    </label>
                    <input
                      type="text"
                      name="headerSubTitle"
                      value={headerData.headerSubTitle}
                      onChange={(e) => {
                        setHeaderData({
                          ...headerData,
                          headerSubTitle: e.target.value,
                        });
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-lg font-medium text-black">
                      Header Image
                    </label>
                    <input
                      type="file"
                      name="headerImage"
                      onChange={(e) => setHeaderImage(e.target.files[0])}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {/* Home Card Data */}
                <div className="w-full mt-4">
                  <h2 className="text-black text-[19px] font-semibold">
                    Home Card Data
                  </h2>
                  <div>
                    <label className="block text-lg font-medium text-black">
                      Home Card Icon
                    </label>
                    <input
                      type="file"
                      name="homeCardIcon"
                      onChange={(e) => setHomeCardIcon(e.target.files[0])}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-lg font-medium text-black">
                      Home Card Points
                    </label>
                    {homeCardPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mt-2"
                      >
                        <input
                          type="text"
                          name={`point-${index}`}
                          // value={point}
                          onChange={(e) =>
                            handleInputChange(e, "homeCardPoints", index)
                          }
                          className="w-full p-2 border rounded"
                          placeholder={`Point ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setHomeCardPoints(
                              homeCardPoints.filter((_, i) => i !== index)
                            )
                          }
                          className="w-full p-2 border rounded"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addPointField}
                      className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-2"
                    >
                      Add Another Point
                    </button>
                  </div>
                </div>
              </div>

              {/* Course Statistics Data */}
              <div className="w-[48%] h-[70vh] overflow-y-auto">
                <div className="w-full mt-4">
                  <h2 className="text-black text-[19px] font-semibold">
                    Course Statistic Data
                  </h2>
                  <div className="mt-2">
                    <label className="block text-lg font-medium text-black">
                      Course Statistics Title
                    </label>
                    <input
                      type="text"
                      name="Title"
                      // value={courseStatistics.Title}
                      onChange={(e) => handleInputChange(e, "courseStatistics")}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  {courseStatistics.data.map((stat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="mt-2">
                        <label className="block text-lg font-medium text-black">
                          Statistic Title {index + 1}
                        </label>
                        <input
                          type="text"
                          name="title"
                          onChange={(e) =>
                            handleInputChange(e, "courseStatistics", index)
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="mt-2">
                        <label className="block text-lg font-medium text-black">
                          Statistic Subtitle {index + 1}
                        </label>
                        <input
                          type="text"
                          name="subTitle"
                          // value={stat.subTitle}
                          onChange={(e) =>
                            handleInputChange(e, "courseStatistics", index)
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStatisticField}
                    className="bg-blue-500 mt-2 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Add Another Statistic
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 mt-4"
                  >
                    Submit
                  </button>
                  <Link
                    href="/dashboard/latestCourseCategory/courseCategoryTable"
                    className="bg-slate-200 text-black hover:text-white px-4 py-2 rounded shadow-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 mt-4"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AddCourseCategory;
