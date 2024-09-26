"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
);

const BroucherCMS = () => {
    const router = useRouter();
    const [userauth, setuserauth] = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [brouchers, setBrouchers] = useState([]);
    const [filteredbrouchers, setfilteredbrouchers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBroucher, setEditingBroucher] = useState(null);
    const [category, setCategory] = useState("");
    const [brocherFile, setBrocherFile] = useState(null);
    const [courseCategories, setCourseCategories] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState([]);
    const [subCategory, setSubCategory] = useState("");


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    // Calculate the items to display on the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredbrouchers.slice(indexOfFirstItem, indexOfLastItem);

    // Determine the total number of pages
    const totalPages = Math.ceil(filteredbrouchers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Fetch all brochures
    useEffect(() => {
        if (!userauth || !userauth.token) {
            router.push("/"); // Redirect to login page if not authenticated
        } else {
            fetchCourseCategories();
            fetchPrograms();
            fetchBrouchers();
        }
    }, [userauth, router]);

    const fetchCourseCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "https://backend-neon-nu.vercel.app/get-all-coursecategory"
            );
            setCourseCategories(response.data);
        } catch (err) {
            setError("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const fetchPrograms = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "https://backend-neon-nu.vercel.app/get-extensive-program"
            );
            setPrograms(response.data);
        } catch (err) {
            setError("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    const fetchBrouchers = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://backend-neon-nu.vercel.app/get-brouchers");
            setBrouchers(response.data);
            setfilteredbrouchers(response.data);
        } catch (error) {
            console.error("Error fetching brochures", error);
        } finally {
            setLoading(false);
        }
    };

    const filterPrograms = (category) => {
        const filteredData = programs.filter((item) => item.Category === category);
        setSelectedProgram(filteredData);
    };

    // Handle form submission for creating or updating a brochure
    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("category", category);
        formData.append("subCategory", subCategory);
        if (brocherFile) {
            formData.append("brocher", brocherFile);
        }

        try {
            if (editingBroucher) {
                await axios.put(
                    `https://backend-neon-nu.vercel.app/update-broucher-by-id/${editingBroucher}`,
                    formData
                );
                Swal.fire("Success", "Brochure updated successfully", "success");
                setEditingBroucher(null);
            } else {
                await axios.post("https://backend-neon-nu.vercel.app/add-broucher", formData);
                Swal.fire("Success", "Brochure created successfully", "success");
            }
            fetchBrouchers();
            handleCloseForm();
        } catch (error) {
            console.error("Error saving brochure", error);
            Swal.fire("Error", "Failed to save brochure", "error");
        }
    };

    // Handle editing a brochure
    const handleEdit = (broucher) => {
        setEditingBroucher(broucher._id);
        setCategory(broucher.category);
        setShowForm(true);
    };

    // Handle deleting a brochure
    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://backend-neon-nu.vercel.app/delete-broucher/${id}`);
            fetchBrouchers();
            Swal.fire("Deleted!", "Brochure has been deleted.", "success");
        } catch (error) {
            console.error("Error deleting brochure", error);
            Swal.fire("Error", "Failed to delete brochure", "error");
        }
    };

    // Handle form close
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingBroucher(null);
        setCategory("");
        setBrocherFile(null);
    };

    const handleFilterChange = (e) => {
        if (e.target.value === "") {
            setfilteredbrouchers(brouchers);
        } else {
            setfilteredbrouchers(brouchers.filter(name => name.subCategory === e.target.value));
        }
    };

    return (
        <>
            {loading ? (
                <Spinner />
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="p-6 bg-gray-100 text-black">
                    <div className="flex justify-between mb-4">
                        <h1 className="text-2xl font-bold">Brochure Management</h1>
                        <select
                            className="p-2 border border-gray-300 rounded text-black"
                            onChange={handleFilterChange}
                        >
                            <option value="">All programs</option>
                            {programs &&
                                programs.map((data) => (
                                    <option key={data._id} value={data.cardData.programName}>
                                        {data.cardData.programName}
                                    </option>
                                ))}
                        </select>
                        <button
                            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            onClick={() => setShowForm(true)}
                        >
                            <FaPlus />
                        </button>
                    </div>
                    {/* Table to display brochures */}
                    <div className="container mx-auto text-black text-center">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="py-2 px-4 border-b">Category</th>
                                    <th className="py-2 px-4 border-b">subCategory</th>
                                    <th className="py-2 px-4 border-b">Brochure Link</th>
                                    <th className="py-2 px-4 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((broucher) => (
                                    <tr key={broucher._id} className="text-center border-b">
                                        <td className="py-2 px-4 ">{broucher.category}</td>
                                        <td className="py-2 px-4 ">{broucher.subCategory}</td>
                                        <td className="py-2 px-4 ">
                                            <button className="border border-black text-white py-1 px-2 hover:bg-slate-800  bg-gray-600 ">
                                                <a
                                                    href={broucher.brocher}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue"
                                                >
                                                    View Brochure
                                                </a>
                                            </button>
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <button
                                                className="mr-4 text-green-500 hover:text-green-700"
                                                onClick={() => handleEdit(broucher)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDelete(broucher._id)}
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

                    {/* Popup form for adding/editing brochures */}
                    {showForm && (
                        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 text-black">
                            <div className="bg-white p-6 rounded shadow-lg w-96">
                                <h2 className="text-xl mb-4">
                                    {editingBroucher ? "Edit Brochure" : "Add Brochure"}
                                </h2>
                                <form onSubmit={handleSave}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Category</label>
                                        <select
                                            name=""
                                            id=""
                                            className="w-full p-2 border rounded text-black"
                                            onChange={(e) => {
                                                setCategory(e.target.value);
                                                filterPrograms(e.target.value);
                                            }}
                                        >
                                            <option value="">Select category</option>
                                            {courseCategories &&
                                                courseCategories.map((data) => (
                                                    <option key={data._id} value={data.courseCategory}>
                                                        {data.courseCategory}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Extensive Program</label>
                                        <select
                                            name="category"
                                            id=""
                                            className="w-full p-2 border rounded text-black"
                                            onChange={(e) => setSubCategory(e.target.value)}
                                        >
                                            <option value="">Select program</option>
                                            {selectedProgram &&
                                                selectedProgram.map((data) => (
                                                    <option key={data._id} value={data.cardData.programName}>
                                                        {data.cardData.programName}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2">
                                            Brochure (PDF)
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => setBrocherFile(e.target.files[0])}
                                            className="w-full px-3 py-2 border rounded"
                                            accept=".pdf"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                                            onClick={handleCloseForm}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            {editingBroucher ? "Update" : "Save"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {loading && <Spinner />}
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            )}
        </>
    );
};

export default BroucherCMS;
