"use client";
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
}); 
import Swal from "sweetalert2";
import "./page.css";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const BlogManagementTable = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [courseCategories, setCourseCategories] = useState([]);
  const [cardImagePreview, setCardImagePreview] = useState(null);
  const [headerBgImagePreview, setHeaderBgImagePreview] = useState(null);
  const cardImageInputRef = useRef(null);
  const articleInputRefs = useRef([]);
  const headerBgInputRefs = useRef([]);

  //for dropdown
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category: "",
    blogTitle: "",
    readTime: "",
    date: "",
    views: "",
    blogCardData: { title: "", subTitle: "" },
    cardImage: null,
    headerData: { headerTitle: "", headerSubTitle: "" },
    headerBgImage: null,
    articleData: [{ title: "", description: "" }],
    id: "",
  });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  // Calculate the items to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrograms.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Determine the total number of pages
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };
  const handleCardImageChange = (e) => {
    const file = e.target.files[0];
    setEditFormData({ ...editFormData, cardImage: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCardImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderBgImageChange = (e) => {
    const file = e.target.files[0];
    setEditFormData({ ...editFormData, headerBgImage: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderBgImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArticleInputChange = (index, name, value) => {
    const newArticleData = [...editFormData.articleData];
    newArticleData[index][name] = value;
    setEditFormData({ ...editFormData, articleData: newArticleData });
  };

  const handleAddField = () => {
    setEditFormData({
      ...editFormData,
      articleData: [
        ...editFormData.articleData,
        { title: "", description: "" },
      ],
    });
  };

  const handleRemoveField = (index) => {
    // Remove the specific article data from the form data
    const newArticleData = editFormData.articleData.filter(
      (_, i) => i !== index
    );
    setEditFormData({ ...editFormData, articleData: newArticleData });

    // Clear the input ref for the removed item
    if (headerBgInputRefs.current[index]) {
      headerBgInputRefs.current[index].value = "";
    }

    // Remove the ref for the removed item from the array
    headerBgInputRefs.current = headerBgInputRefs.current.filter(
      (_, i) => i !== index
    );
  };
  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push("/"); // Redirect to login page if not authenticated
    } else {
      fetchCourseCategories();
      fetchBlogs();
    }
  }, [userauth, router]);

  const fetchCourseCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://trialtmbackend.vercel.app/api/get-all-coursecategory"
      );
      setCourseCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://trialtmbackend.vercel.app/api/get-blogs");
      setBlogs(response.data);
      setFilteredPrograms(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching blogs");
      setLoading(false);
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
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://trialtmbackend.vercel.app/api/delete-blog-by-id/${id}`);
          fetchBlogs();
          Swal.fire("Success", "Blog deleted successfully", "success");
        } catch (err) {
          console.error("Error deleting blog:", err);
          Swal.fire("Error", "Error deleting blog. Please try again.", "error");
        }
      }
    });
  };
  const handleRemoveFile = () => {
    setEditFormData((prevData) => ({
      ...prevData,
      profilePic: null,
    }));
    setHeaderBgImagePreview(null);

    if (headerBgInputRefs.current) {
      headerBgInputRefs.current.value = "";
    }
  };

  const handleRemoveCardImage = () => {
    // Update the form data to remove the card image
    setEditFormData((prevData) => ({
      ...prevData,
      cardImage: null,
    }));

    // Clear the image preview
    setCardImagePreview(null);

    // Reset the file input field
    if (cardImageInputRef.current) {
      cardImageInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append("category", editFormData.category);
    formDataToSend.append("blogTitle", editFormData.blogTitle);
    formDataToSend.append("readTime", editFormData.readTime);
    formDataToSend.append("date", editFormData.date);
    formDataToSend.append("views", editFormData.views);
    formDataToSend.append(
      "blogCardData",
      JSON.stringify(editFormData.blogCardData)
    );
    if (editFormData.cardImage)
      formDataToSend.append("cardImage", editFormData.cardImage);
    formDataToSend.append(
      "headerData",
      JSON.stringify(editFormData.headerData)
    );
    if (editFormData.headerBgImage)
      formDataToSend.append("headerBgImage", editFormData.headerBgImage);
    formDataToSend.append(
      "articleData",
      JSON.stringify(editFormData.articleData)
    );

    try {
      if (editMode) {
        await axios.put(
          `https://trialtmbackend.vercel.app/api/edit-blog/${editFormData.id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        Swal.fire("Success", "Blog updated successfully", "success");
      } else {
        await axios.post("https://trialtmbackend.vercel.app/api/add-blog", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Success", "Blog added successfully", "success");
      }
      fetchBlogs();
      setShowFormPopup(false);
    } catch (err) {
      console.error("Error adding/editing blog:", err);
      Swal.fire(
        "Error",
        "Error adding/editing blog. Please try again.",
        "error"
      );
    }
  };

  const handleOpenFormPopup = (blog = null) => {
    if (blog) {
      setEditFormData({
        category: blog.category || "",
        blogTitle: blog.blogTitle || "",
        readTime: blog.readTime || "",
        date: blog.date || "",
        views: blog.views || "",
        blogCardData: blog.blogCardData || { title: "", subTitle: "" },
        cardImage: null,
        headerData: blog.headerData || { headerTitle: "", headerSubtitle: "" },
        headerBgImage: null,
        articleData: blog.articleData || [{ title: "", description: "" }],
        id: blog._id,
      });
      setEditMode(true);
    } else {
      setEditFormData({
        category: "",
        blogTitle: "",
        readTime: "",
        date: "",
        views: "",
        blogCardData: { title: "", subTitle: "" },
        cardImage: null,
        headerData: { headerTitle: "", headerSubtitle: "" },
        headerBgImage: null,
        articleData: [{ title: "", description: "" }],
        id: "",
      });
      setEditMode(false);
    }
    setShowFormPopup(true);
  };

  const handleCloseFormPopup = () => {
    setShowFormPopup(false);
  };

  const handleFilterChange = (e) => {
    if (e.target.value === "") {
      setFilteredPrograms(blogs);
    } else {
      setFilteredPrograms(
        blogs.filter((category) => category.category === e.target.value)
      );
    }
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="container mx-auto p-4 bg-gray-100 text-black">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold ">Blogs</h2>
            <div className="flex items-center space-x-4">
              <select
                onChange={handleFilterChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {courseCategories.map((category) => (
                  <option key={category._id} value={category.courseCategory}>
                    {category.courseCategory}
                  </option>
                ))}
              </select>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center shadow-md hover:bg-blue-700 transition-colors"
                onClick={handleOpenFormPopup}
              >
                <FaPlus className="mr-2" />
                Add Blog
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white border-b">
                <tr>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4">Title</th>
                  <th className="py-2 px-4">Read Time</th>
                  <th className="py-2 px-4">Date</th>
                  <th className="py-2 px-4">Views</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {currentItems &&
                  currentItems.map((blog) => (
                    <tr key={blog._id} className="text-center border-b">
                      <td className="py-2 px-4 ">{blog.category}</td>
                      <td className="py-2 px-4 ">{blog.blogTitle}</td>
                      <td className="py-2 px-4 ">{blog.readTime}</td>
                      <td className="py-2 px-4 ">{blog.date}</td>
                      <td className="py-2 px-4 ">{blog.views}</td>
                      <td className="py-2 px-4 ">
                        <button
                          className="text-green-500 hover:text-green-700 mr-4"
                          onClick={() => handleOpenFormPopup(blog)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(blog._id)}
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
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white"
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
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white"
              }`}
            >
              Next
            </button>
          </div>

          {showFormPopup && (
            <div className="fixed h-[80vh] overflow-y-auto top-10 left-[40%] custom-scrollbar">
              <div className="bg-white p-8 shadow-lg w-full max-w-2xl text-black">
                <h3 className="text-2xl font-bold mb-4">
                  {editMode ? "Edit Blog" : "Add Blog"}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleFormSubmit();
                  }}
                >
                  <label>Category</label>
                  <select
                    name="category"
                    id=""
                    className="block w-full p-2 border mb-4"
                    onChange={handleInputChange}
                  >
                    <option value="">select category</option>
                    {courseCategories &&
                      courseCategories.map((data) => {
                        return (
                          <option value={data.courseCategory} key={data._id}>
                            {data.courseCategory}
                          </option>
                        );
                      })}
                  </select>
                  <label>Blog Title</label>
                  <input
                    type="text"
                    name="blogTitle"
                    value={editFormData.blogTitle}
                    onChange={handleInputChange}
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Read Time</label>
                  <input
                    type="text"
                    name="readTime"
                    value={editFormData.readTime}
                    onChange={handleInputChange}
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={editFormData.date}
                    onChange={handleInputChange}
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Views</label>
                  <input
                    type="text"
                    name="views"
                    value={editFormData.views}
                    onChange={handleInputChange}
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Blog Card Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.blogCardData.title}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        blogCardData: {
                          ...editFormData.blogCardData,
                          title: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Blog Card Subtitle</label>
                  <input
                    type="text"
                    name="subTitle"
                    value={editFormData.blogCardData.subTitle}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        blogCardData: {
                          ...editFormData.blogCardData,
                          subTitle: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Card Image</label>
                  <input
                    type="file"
                    name="cardImage"
                    onChange={handleCardImageChange}
                    ref={cardImageInputRef}
                    className="block w-full p-2 border mb-4"
                  />
                  {cardImagePreview && (
                    <div className="mt-2">
                      <Image
                        src={cardImagePreview}
                        alt="Card Image Preview"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveCardImage}
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                  <label>Header Title</label>
                  <input
                    type="text"
                    name="headerTitle"
                    value={editFormData.headerData.headerTitle}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        headerData: {
                          ...editFormData.headerData,
                          headerTitle: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Header Subtitle</label>
                  <input
                    type="text"
                    name="headerSubTitle"
                    value={editFormData.headerData.headerSubTitle}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        headerData: {
                          ...editFormData.headerData,
                          headerSubTitle: e.target.value,
                        },
                      })
                    }
                    className="block w-full p-2 border mb-4"
                    required
                  />
                  <label>Header Background Image</label>
                  <input
                    type="file"
                    name="headerBgImage"
                    ref={headerBgInputRefs}
                    onChange={handleHeaderBgImageChange}
                    className="block w-full p-2 border mb-4"
                  />
                  {headerBgImagePreview && (
                    <div className="mt-2">
                      <Image
                        src={headerBgImagePreview}
                        alt="Header Background Image Preview"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                      <button
                        type="button"
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                        onClick={handleRemoveFile}
                      >
                        Remove Article
                      </button>
                    </div>
                  )}

                  <div>
                    <label>Articles</label>
                    {editFormData.articleData.map((article, index) => (
                      <div key={index} className="mb-4">
                        <label className="block mb-2">Article Title:</label>
                        <input
                          type="text"
                          name="title"
                          value={article.title}
                          onChange={(e) =>
                            handleArticleInputChange(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                        <label className="block mt-2 mb-2">
                          Article Description:
                        </label>
                        <JoditEditor
                          value={article.description}
                          onChange={(value) =>
                            handleArticleInputChange(
                              index,
                              "description",
                              value
                            )
                          }
                        />
                        <button
                          type="button"
                          className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                          onClick={() => handleRemoveField(index)}
                        >
                          Remove Article
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={handleAddField}
                    >
                      Add Article
                    </button>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                      onClick={handleCloseFormPopup}
                    >
                      Cancel
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

export default BlogManagementTable;
