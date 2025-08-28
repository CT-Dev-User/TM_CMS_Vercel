"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import "./page.css";

const HireFromForm = ({ showModal, setShowModal, editData, fetchHireFromData }) => {
    const [courseCategories, setCourseCategories] = useState([]);
    const [formData, setFormData] = useState({
        category: "",
        ProfessionalSpokenEnglishTrainingSession: "",
        AptitudeTestAndLogicalReasoningCriticalThinking: "",
        MindsetBatchForGrowthInCareer: "",
        inventoryAvailable: [{ number: "", title: "" }],
    });

    // Populate form data when editing
    useEffect(() => {
        if (editData) {
            setFormData({
                ...editData,
                inventoryAvailable: editData.inventoryAvailable || [{ number: "", title: "" }],
            });
        }
    }, [editData]);

    // Fetch course categories on component mount
    useEffect(() => {
        fetchCourseCategories();
    }, []);

    // Fetch course categories from the backend
    const fetchCourseCategories = async () => {
        try {
            const response = await axios.get('https://trialtmbackend.vercel.app/api/get-all-coursecategory');
            setCourseCategories(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    // Handle input changes for standard fields
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle dynamic array input changes
    const handleArrayChange = (e, index, field, arrayName) => {
        const newArray = [...formData[arrayName]];
        newArray[index][field] = e.target.value;
        setFormData({ ...formData, [arrayName]: newArray });
    };

    // Add new item to dynamic array
    const handleAddArrayItem = (arrayName, defaultItem) => {
        const currentArray = Array.isArray(formData[arrayName]) ? formData[arrayName] : [];
        setFormData({ ...formData, [arrayName]: [...currentArray, defaultItem] });
    };

    // Remove item from dynamic array
    const handleRemoveArrayItem = (index, arrayName) => {
        const newArray = formData[arrayName].filter((_, i) => i !== index);
        setFormData({ ...formData, [arrayName]: newArray });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editData) {
                // Update existing record
                await axios.put(`https://trialtmbackend.vercel.app/api/update-hire-from/${editData._id}`, formData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                Swal.fire("Updated!", "Your data has been updated.", "success");
            } else {
                // Create new record
                await axios.post("https://trialtmbackend.vercel.app/api/add-hire-from-data", formData, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                Swal.fire("Added!", "Your data has been added.", "success");
            }
            fetchHireFromData(); // Refresh data after submission
            setShowModal(false); // Close modal
        } catch (error) {
            console.error("Error saving Hire From data:", error);
            Swal.fire("Error!", "There was an issue saving the data.", "error");
        }
    };

    return (
        <div className={`absolute top-1 left-48 flex items-center justify-center custom-scrollbar overflow-y-auto w-1/2 ${showModal ? "block" : "hidden"}`}>
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">{editData ? "Edit Hire From" : "Add Hire From"}</h2>
                <form onSubmit={handleSubmit}>
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        className="block w-full p-2 border mb-4"
                        onChange={handleInputChange}
                    >
                        <option value="">Select category</option>
                        {courseCategories && courseCategories.map((data) => (
                            <option key={data._id} value={data.courseCategory}>
                                {data.courseCategory}
                            </option>
                        ))}
                    </select>

                    {formData.inventoryAvailable.map((item, index) => (
                        <div key={index} className="mb-4">
                            <input
                                type="text"
                                value={item.number}
                                onChange={(e) => handleArrayChange(e, index, "number", "inventoryAvailable")}
                                placeholder="Inventory Number"
                                className="mb-2 px-4 py-2 border rounded w-full"
                            />
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleArrayChange(e, index, "title", "inventoryAvailable")}
                                placeholder="Inventory Title"
                                className="mb-2 px-4 py-2 border rounded w-full"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveArrayItem(index, "inventoryAvailable")}
                                className="text-red-500 mt-2 px-4 py-2 rounded bg-slate-400"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddArrayItem("inventoryAvailable", { number: "", title: "" })}
                        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                    >
                        Add Inventory
                    </button>

                    <label className="block text-gray-700 mb-2">Pro Spoken English (Saperated by commas)</label>
                    <input
                        type="text"
                        name="ProfessionalSpokenEnglishTrainingSession"
                        value={formData.ProfessionalSpokenEnglishTrainingSession}
                        onChange={handleInputChange}
                        placeholder="Professional Spoken English Training Session"
                        className="block w-full p-2 border mb-4"
                    />

                    <label className="block text-gray-700 mb-2">Aptitude & Logical Reasoning (Saperated by commas)</label>
                    <input
                        type="text"
                        name="AptitudeTestAndLogicalReasoningCriticalThinking"
                        value={formData.AptitudeTestAndLogicalReasoningCriticalThinking}
                        onChange={handleInputChange}
                        placeholder="Aptitude Test and Logical Reasoning Critical Thinking"
                        className="block w-full p-2 border mb-4"
                    />

                    <label className="block text-gray-700 mb-2">Mindset Batch (Saperated by commas)</label>
                    <input
                        type="text"
                        name="MindsetBatchForGrowthInCareer"
                        value={formData.MindsetBatchForGrowthInCareer}
                        onChange={handleInputChange}
                        placeholder="Mindset Batch for Growth in Career"
                        className="block w-full p-2 border mb-4"
                    />

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            {editData ? "Update" : "Add"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HireFromForm;
