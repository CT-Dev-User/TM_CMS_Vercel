'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './page.css'
import { useAuth } from "@/app/contextApi/UserContext";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
);
const EditCourseCategory = ({ params }) => {

    const id = params.editId;
    const router = useRouter();
    const [userauth, setuserauth] = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [courseCategory, setCourseCategory] = useState('');
    const [homeCardIcon, setHomeCardIcon] = useState(null);
    const [headerImage, setHeaderImage] = useState(null);
    const [headerData, setHeaderData] = useState({
        headerTitle: '',
        headerSubTitle: '',
    });
    const [courseStatistics, setCourseStatistics] = useState({
        Title: '',
        data: [{ title: '', subTitle: '' }]
    });
    const [homeCardPoints, setHomeCardPoints] = useState(['']);

    useEffect(() => {
        if (!userauth || !userauth.token) {
            router.push('/'); // Redirect to login page if not authenticated
        } else {
            const fetchCourseCategory = async () => {
                setLoading(true)
                try {
                    const response = await axios.get(`https://trialtmbackend.vercel.app/get-coursecategory-by-id/${id}`);
                    const data = response.data;
                    setCourseCategory(data.courseCategory);
                    setHomeCardIcon(data.homeCard.icon);
                    setHeaderImage(data.headerData.headerBgImage);
                    setHeaderData(data.headerData);
                    setCourseStatistics(data.courseStatistics);
                    setHomeCardPoints(data.homeCard.points);
                    setLoading(false)
                } catch (err) {
                    console.error('Error fetching course category:', err);
                }
            };
            fetchCourseCategory();
        }
    }, [userauth, router, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('courseCategory', courseCategory);
        formData.append('headerData', JSON.stringify(headerData));
        formData.append('courseStatistics', JSON.stringify(courseStatistics));
        formData.append('homeCard', JSON.stringify({
            points: homeCardPoints,
        }));

        if (headerImage) {
            formData.append('headerImage', headerImage);
        }
        if (homeCardIcon) {
            formData.append('homeCardIcon', homeCardIcon);
        }

        try {
            const response = await axios.put(`https://trialtmbackend.vercel.app/edit-course-category/${id}`, formData);
            if (response.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Course category updated successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    router.push('/dashboard/latestCourseCategory/courseCategoryTable');
                });
            }
        } catch (error) {
            console.error('Error updating course category:', error);
            Swal.fire({
                title: 'Error!',
                text: 'There was an error updating the course category.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    const handleInputChange = (e, type, index = null) => {
        const { name, value } = e.target;

        if (type === 'homeCardPoints') {
            setHomeCardPoints(homeCardPoints.map((point, i) => i === index ? value : point));
        } else if (type === 'courseStatistics') {
            const updatedData = [...courseStatistics.data];
            updatedData[index][name] = value;
            setCourseStatistics({ ...courseStatistics, data: updatedData });
        } else if (type === 'headerData') {
            setHeaderData({ ...headerData, [name]: value });
        }
    };

    const addCourseStatistic = () => {
        setCourseStatistics({
            ...courseStatistics,
            data: [...courseStatistics.data, { title: '', subTitle: '' }],
        });
    };

    const removeCourseStatistic = (index) => {
        setCourseStatistics({
            ...courseStatistics,
            data: courseStatistics.data.filter((_, i) => i !== index),
        });
    };

    const addPointField = () => {
        setHomeCardPoints([...homeCardPoints, '']);
    };

    const handleCancel = () => {
        router.push('/dashboard/latestCourseCategory/courseCategoryTable');
    };

    return (
        <>
            {loading ? (
                <Spinner />
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="container mx-auto p-6 bg-white rounded-lg shadow-md text-black">
                    <h2 className="text-3xl font-semibold mb-6 text-center text-black">Edit Course Category</h2>
                    <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="flex w-full justify-between">
                            <div className="w-[48%]">
                                {/* Course Category */}
                                <div>
                                    <label className="block text-lg font-medium text-black">Course Category</label>
                                    <input
                                        type="text"
                                        name="courseCategory"
                                        value={courseCategory}
                                        onChange={(e) => setCourseCategory(e.target.value)}
                                        className="w-full p-2 border rounded" />
                                </div>

                                {/* Header Data */}
                                <div className="w-full mt-4">
                                    <h2 className="text-black text-[19px] font-semibold">Header Data</h2>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium text-black">Header Title</label>
                                        <input
                                            type="text"
                                            name="headerTitle"
                                            value={headerData.headerTitle}
                                            onChange={(e) => setHeaderData({ ...headerData, headerTitle: e.target.value })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium text-black">Header Subtitle</label>
                                        <input
                                            type="text"
                                            name="headerSubTitle"
                                            value={headerData.headerSubTitle}
                                            onChange={(e) => setHeaderData({ ...headerData, headerSubTitle: e.target.value })}
                                            className="w-full p-2 border rounded" />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium text-black">Header Image</label>
                                        <input
                                            type="file"
                                            name="headerImage"
                                            onChange={(e) => setHeaderImage(e.target.files[0])}
                                            className="w-full p-2 border rounded" />
                                    </div>
                                </div>

                                {/* Home Card Data */}
                                <div className="w-full mt-4">
                                    <h2 className="text-black text-[19px] font-semibold">Home Card Data</h2>
                                    <div>
                                        <label className="block text-lg font-medium text-black">Home Card Icon</label>
                                        <input
                                            type="file"
                                            name="homeCardIcon"
                                            onChange={(e) => setHomeCardIcon(e.target.files[0])}
                                            className="w-full p-2 border rounded" />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium text-black">Home Card Points</label>
                                        {homeCardPoints.map((point, index) => (
                                            <div key={index} className="flex items-center space-x-2 mt-2">
                                                <input
                                                    type="text"
                                                    name={`point-${index}`}
                                                    value={point}
                                                    onChange={(e) => handleInputChange(e, 'homeCardPoints', index)}
                                                    className="w-full p-2 border rounded"
                                                    placeholder={`Point ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setHomeCardPoints(homeCardPoints.filter((_, i) => i !== index))}
                                                    className="bg-red-500 text-white px-2 py-1 rounded shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
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
                            <div className="w-[48%]">
                                <div className="w-full mt-4">
                                    <h2 className="text-black text-[19px] font-semibold">Course Statistic Data</h2>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium text-black">Course Statistics Title</label>
                                        <input
                                            type="text"
                                            name="Title"
                                            value={courseStatistics.Title}
                                            onChange={(e) => handleInputChange(e, 'courseStatistics')}
                                            className="w-full p-2 border rounded" />
                                    </div>
                                    {courseStatistics.data.map((stat, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="mt-2">
                                                <label className="block text-lg font-medium text-black">Statistic Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={stat.title}
                                                    onChange={(e) => handleInputChange(e, 'courseStatistics', index)}
                                                    className="w-full p-2 border rounded" />
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-lg font-medium text-black">Statistic Subtitle</label>
                                                <input
                                                    type="text"
                                                    name="subTitle"
                                                    value={stat.subTitle}
                                                    onChange={(e) => handleInputChange(e, 'courseStatistics', index)}
                                                    className="w-full p-2 border rounded" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeCourseStatistic(index)}
                                                className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                            >
                                                Remove Statistic
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addCourseStatistic}
                                        className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mt-2"
                                    >
                                        Add Another Statistic
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end mt-6 space-x-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-gray-400 text-white px-4 py-2 rounded shadow-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}</>
    );
};

export default EditCourseCategory;
