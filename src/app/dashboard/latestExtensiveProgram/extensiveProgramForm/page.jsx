'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useAuth } from "@/app/contextApi/UserContext";
import '../../../ui/dashboard/dasshboard.css';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
  })

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
);

const AddExtensiveProgram = () => {
    const router = useRouter();
    const [userauth, setuserauth] = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [courseCategories, setCourseCategories] = useState([]);
    const [courseCategory, setCourseCategory] = useState('');
    const [headerImage, setHeaderImage] = useState(null);
    const [highlightsIcons, setHighlightsIcons] = useState([]);
    const [topInDemandToolsLogos, setTopInDemandToolsLogos] = useState([]);

    const [cardData, setCardData] = useState({
        programstatus: '',
        programName: '',
        programDuration: '',
        modeOfClass: '',
        skillsYouDeveloped: '',
        toolsToBeComplete: '',
        bgGradientColor: '',
    });
    const [headerData, setHeaderData] = useState({
        headerTitle: '',
        headerSubTitle: '',
    });
    const [highlights, setHighlights] = useState({
        title: '',
        subTitle: '',
        highlightPoints: [{ point: '' }]
    });
    const [courseCurriculam, setCourseCurriculam] = useState([{ heading: '', topic: [], keyTakeways: [] }]);
    const [skillYouLearn, setSkillYouLearn] = useState('');
    const [topInDemandTools, setTopInDemandTools] = useState([{ logo: '', toolsName: '' }]);
    const [FeesStuctures, setFeesStuctures] = useState({
        onTimePayment: { discount: '', originalFees: '', duration: '' },
        MonthlyPayment: { discount: '', originalFees: '', duration: '' },
        scollerShip: { discount: '', originalFees: '', duration: '' },
    });

    const headerTitleEditor = useRef(null)
    const headerSubTitleEditor = useRef(null)

    useEffect(() => {
        if (!userauth || !userauth.token) {
            router.push('/'); // Redirect to login page if not authenticated
        } else {
            fetchCourseCategories();
        }
    }, [userauth, router]);

    const fetchCourseCategories = async () => {
        setLoading(true)
        try {
            const response = await axios.get('https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/get-all-coursecategory');
            setCourseCategories(response.data);
            setLoading(false)
        } catch (err) {
            console.log(err)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        console.log(formData)
        formData.append('Category', courseCategory);
        formData.append('cardData', JSON.stringify(cardData));
        formData.append('headerData', JSON.stringify(headerData));
        formData.append('highlights', JSON.stringify(highlights));
        formData.append('courseCurriculam', JSON.stringify(courseCurriculam));
        formData.append('skillYouLearn', skillYouLearn);
        formData.append('topInDemandTools', JSON.stringify(topInDemandTools));
        formData.append('FeesStuctures', JSON.stringify(FeesStuctures));

        formData.append('headerImage', headerImage);
        for (const file of highlightsIcons) {
            formData.append('highlightsIcon', file);
        }
        for (const file of topInDemandToolsLogos) {
            formData.append('topInDemandToolsLogo', file);
        }

        try {
            await axios.post('https://tmbackend-bakyrwvoq-tech-momentum.vercel.app/add-extensive-program', formData);
            Swal.fire('Success', 'Program data added successfully', 'success');
            router.push('/dashboard/latestExtensiveProgram/programTable'); // Redirect after successful submission
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };


    const handleInputChange = (e, section, index = null, subIndex = null) => {
        const { name, value, type, files } = e.target;

        if (section === 'courseCategory') {
            setCourseCategory(value);
        } else if (section === 'headerData') {
            setHeaderData({ ...headerData, [name]: value });
        } else if (section === 'cardData') {
            setCardData({ ...cardData, [name]: value });
        } else if (section === 'highlights') {
            setHighlights({ ...highlights, [name]: value });
        } else if (section === 'highlightPoints') {
            if (index !== null) {
                const updatedPoints = [...highlights.highlightPoints];
                updatedPoints[index] = { ...updatedPoints[index], [name]: value };
                setHighlights({ ...highlights, highlightPoints: updatedPoints });
            }
        } else if (section === 'highlightsIcons') {
            if (index !== null && files && files[0]) {
                const updatedIcons = [...highlightsIcons];
                updatedIcons[index] = files[0];
                setHighlightsIcons(updatedIcons);
            }
        } else if (section === 'topInDemandTools') {
            if (index !== null) {
                if (type === 'file' && files && files[0]) {
                    const updatedTools = [...topInDemandTools];
                    updatedTools[index] = {
                        ...updatedTools[index],
                        logo: files[0]
                    };
                    setTopInDemandTools(updatedTools);
                    setTopInDemandToolsLogos([...topInDemandToolsLogos, files[0]]);
                } else if (type === 'text') {
                    const updatedTools = [...topInDemandTools];
                    updatedTools[index] = {
                        ...updatedTools[index],
                        [name]: value
                    };
                    setTopInDemandTools(updatedTools);
                }
            }

        } else if (section === 'headerImage') {
            setHeaderImage(files[0]); // Directly set the file for header image
        } else if (section === 'courseCurriculam') {
            if (index !== null) {
                const updatedCurriculam = [...courseCurriculam];
                const { name, value } = e.target;
                if (name === 'heading') {
                    updatedCurriculam[index].heading = value;
                } else if (name === 'topic') {
                    const updatedTopics = [...updatedCurriculam[index].topic];
                    updatedTopics[subIndex] = value;
                    updatedCurriculam[index].topic = updatedTopics;
                } else if (name === 'keyTakeways') {
                    const updatedKeyTakeways = [...updatedCurriculam[index].keyTakeways];
                    updatedKeyTakeways[subIndex] = value;
                    updatedCurriculam[index].keyTakeways = updatedKeyTakeways;
                }
                setCourseCurriculam(updatedCurriculam);
            }
        }
    };


    const addHighlightPoint = () => {
        setHighlights({
            ...highlights,
            highlightPoints: [...highlights.highlightPoints, { point: '' }]
        });

    };

    const removeHighlightPoint = (index) => {
        const updatedPoints = highlights.highlightPoints.filter((_, i) => i !== index);
        setHighlights({ ...highlights, highlightPoints: updatedPoints });
        setHighlightsIcons(highlightsIcons.filter((_, i) => i !== index)); // Also remove corresponding icon
    };

    const addTopic = (index) => {
        const updatedCurriculam = [...courseCurriculam];
        updatedCurriculam[index].topic.push('');
        setCourseCurriculam(updatedCurriculam);
    };

    const removeTopic = (index, subIndex) => {
        const updatedCurriculam = [...courseCurriculam];
        updatedCurriculam[index].topic = updatedCurriculam[index].topic.filter((_, i) => i !== subIndex);
        setCourseCurriculam(updatedCurriculam);
    };

    const addKeyTakeaway = (index) => {
        const updatedCurriculam = [...courseCurriculam];
        updatedCurriculam[index].keyTakeways.push('');
        setCourseCurriculam(updatedCurriculam);
    };

    const removeKeyTakeaway = (index, subIndex) => {
        const updatedCurriculam = [...courseCurriculam];
        updatedCurriculam[index].keyTakeways = updatedCurriculam[index].keyTakeways.filter((_, i) => i !== subIndex);
        setCourseCurriculam(updatedCurriculam);
    };

    const addCurriculum = () => {
        setCourseCurriculam([...courseCurriculam, { heading: '', topic: [''], keyTakeways: [''] }]);
    };

    const removeCurriculum = (index) => {
        setCourseCurriculam(courseCurriculam.filter((_, i) => i !== index));
    };
    const addTopInDemandTool = () => {
        setTopInDemandTools([
            ...topInDemandTools,
            { toolsName: '', logo: '' } // Add a new tool with empty fields
        ]);
    };

    const removeTopInDemandTool = (index) => {
        const updatedTools = topInDemandTools.filter((_, i) => i !== index);
        setTopInDemandTools(updatedTools);
    };


    return (
        <>
            {loading ? (
                <Spinner />
            ) : error ? (
                <p className="text-red-500 ">{error}</p>
            ) : (
                <div className="bg-white p-8 shadow-lg w-full text-black mt-2">
                    <h2 className="text-3xl font-semibold mb-6 text-center">Add Extensive Program</h2>
                    <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="flex w-full justify-between">
                            <div className='w-[48%]'>
                                <div className='w-full'>
                                    <label className="block text-lg font-medium">Category:</label>
                                    <select name="Category" id=""
                                        className="block w-full p-2 border mb-4"
                                        onChange={(e) => { setCourseCategory(e.target.value) }}
                                    >
                                        <option value="">select category</option>
                                        {
                                            courseCategories && courseCategories.map((data) => {
                                                return <option value={data.courseCategory} key={data._id}>{data.courseCategory}</option>
                                            })
                                        }
                                    </select>
                                </div>
                                {/* Header Data */}
                                <div className="w-full mt-4 border p-4">
                                    <h2 className="text-[19px] font-semibold">Header Data</h2>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium">Header Title</label>
                                        <JoditEditor
                                            value={headerData.headerTitle}
                                            ref={headerTitleEditor}
                                            onChange={(value) => setHeaderData({ ...headerData, headerTitle: value })}
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium">Header Subtitle</label>
                                        <JoditEditor
                                            value={headerData.headerSubTitle}
                                            ref={headerSubTitleEditor}
                                            onChange={(value) => setHeaderData({ ...headerData, headerSubTitle: value })}
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium">Header Image</label>
                                        <input
                                            type="file"
                                            name="headerImage"
                                            onChange={(e) => handleInputChange(e, 'headerImage')}
                                            className="block w-full p-2 border mb-4"
                                        />
                                    </div>
                                </div>
                                {/* Highlights */}
                                <div className="w-full mt-4 border p-4">
                                    <h2 className="text-[19px] font-semibold">Highlights</h2>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={highlights.title}
                                            onChange={(e) => handleInputChange(e, 'highlights')}
                                            className="block w-full p-2 border mb-4"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium">Subtitle</label>
                                        <input
                                            type="text"
                                            name="subTitle"
                                            value={highlights.subTitle}
                                            onChange={(e) => handleInputChange(e, 'highlights')}
                                            className="block w-full p-2 border mb-4"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-lg font-medium text-black">Highlight Points</label>
                                        {highlights.highlightPoints.map((point, index) => (
                                            <div key={index} className="flex flex-col gap-1 mt-2">
                                                <label className="block text-md font-medium">Point</label>
                                                <input
                                                    type="text"
                                                    name="point"
                                                    value={point.point}
                                                    onChange={(e) => handleInputChange(e, 'highlightPoints', index)}
                                                    className="block w-full p-2 border mb-4"
                                                />
                                                <label className="block text-md font-medium">Logo</label>

                                                <input
                                                    type="file"
                                                    onChange={(e) => handleInputChange(e, 'highlightsIcons', index)}
                                                    className="block w-full p-2 border mb-4"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => removeHighlightPoint(index)}
                                                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md w-fit"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addHighlightPoint}
                                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                                        >
                                            Add Highlight Point
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full mt-4">
                                    <h2 className="text-[19px] font-semibold">Course Curriculum</h2>
                                    {courseCurriculam.map((curriculum, index) => (
                                        <div key={index} className="mt-2 border p-4 rounded-md">
                                            <div>
                                                <label className="block text-lg font-medium">Heading</label>
                                                <input
                                                    type="text"
                                                    name="heading"
                                                    value={curriculum.heading}
                                                    onChange={(e) => handleInputChange(e, 'courseCurriculam', index)}
                                                    className="block w-full p-2 border mb-4"
                                                />
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-lg font-medium">Topics</label>
                                                {curriculum.topic.map((topic, subIndex) => (
                                                    <div key={subIndex} className="flex items-center mt-2">
                                                        <input
                                                            type="text"
                                                            name="topic"
                                                            value={topic}
                                                            onChange={(e) => handleInputChange(e, 'courseCurriculam', index, subIndex)}
                                                            className="block w-full p-2 border mb-4" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTopic(index, subIndex)}
                                                            className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md"
                                                        >
                                                            Remove Topic
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addTopic(index)}
                                                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                                                >
                                                    Add Topic
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-lg font-medium">Key Takeaways</label>
                                                {curriculum.keyTakeways.map((keyTakeaway, subIndex) => (
                                                    <div key={subIndex} className="flex items-center mt-2">
                                                        <input
                                                            type="text"
                                                            name="keyTakeways"
                                                            value={keyTakeaway}
                                                            onChange={(e) => handleInputChange(e, 'courseCurriculam', index, subIndex)}
                                                            className="block w-full p-2 border mb-4" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeKeyTakeaway(index, subIndex)}
                                                            className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addKeyTakeaway(index)}
                                                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeCurriculum(index)}
                                                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md"
                                            >
                                                Remove Curriculum
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addCurriculum}
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md"
                                    >
                                        Add Curriculum
                                    </button>
                                </div>

                                {/* Skills You Learn */}
                                <div className="w-full mt-4">
                                    <h2 className="text-[19px] font-semibold">Skills You Learn</h2>
                                    <input
                                        type="text"
                                        name="skillYouLearn"
                                        value={skillYouLearn}
                                        onChange={(e) => setSkillYouLearn(e.target.value)}
                                        className="block w-full p-2 border mb-4" />
                                </div>
                            </div>
                            <div className='w-[48%]'>
                                {/* Card Data */}
                                <div className="w-full mt-4">
                                    <h2 className="text-[19px] font-semibold">Card Data</h2>
                                    {Object.keys(cardData).map((key) => (
                                        <div key={key} className="mt-2">
                                            <label className="block text-md font-medium">{key}</label>
                                            <input
                                                type="text"
                                                name={key}
                                                value={cardData[key]}
                                                onChange={(e) => handleInputChange(e, 'cardData')}
                                                className="block w-full p-2 border mb-4" />
                                        </div>
                                    ))}
                                </div>
                                {/* Top In Demand Tools */}
                                <div className="w-full mt-4">
                                    <h2 className="text-[19px] font-semibold">Top In Demand Tools</h2>
                                    {topInDemandTools.map((tool, index) => (
                                        <div key={index} className="mt-2 border p-4 rounded-md">
                                            <div>
                                                <label className="block text-md font-medium">Tool Name</label>
                                                <input
                                                    type="text"
                                                    name="toolsName"
                                                    value={tool.toolsName}
                                                    onChange={(e) => handleInputChange(e, 'topInDemandTools', index)}
                                                    className="block w-full p-2 border mb-4" />
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-md font-medium">Logo</label>
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleInputChange(e, 'topInDemandTools', index)}
                                                    className="block w-full p-2 border mb-4"
                                                />

                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeTopInDemandTool(index)}
                                                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md"
                                            >
                                                Remove Tool
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addTopInDemandTool}
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md"
                                    >
                                        Add Tool
                                    </button>
                                </div>
                                {/* Fees Structures */}
                                <div className="w-full mt-4">
                                    <h2 className="text-[19px] font-semibold">Fees Structures</h2>
                                    {Object.keys(FeesStuctures).map((key, index) => (
                                        <div key={key} className="mt-2">
                                            <h3 className="text-lg font-medium text-[blue]">{key === "onTimePayment"
                                                ? "One Time Payment"
                                                : key === "MonthlyPayment"
                                                    ? "Monthly Payment"
                                                    : key === "scollerShip"
                                                        ? "Scholarship"
                                                        : ""}</h3>
                                            {Object.keys(FeesStuctures[key]).map((subKey) => (
                                                <div key={subKey}>
                                                    <label className="block text-md font-medium">{subKey}</label>
                                                    <input
                                                        type="text"
                                                        name={subKey}
                                                        value={FeesStuctures[key][subKey]}
                                                        onChange={(e) => setFeesStuctures({
                                                            ...FeesStuctures,
                                                            [key]: { ...FeesStuctures[key], [subKey]: e.target.value }
                                                        })}
                                                        className="block w-full p-2 border mb-4" />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div className='flex gap-3'>
                                    <button
                                        type="submit"
                                        className="mt-6 bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                                    >
                                        Submit
                                    </button>
                                    <Link className="mt-6 px-4 py-2 rounded-md hover:bg-slate-900 hover:text-white" href='/dashboard/latestExtensiveProgram/programTable'>
                                        Cancel
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </form>
                </div>
            )}</>
    );
};

export default AddExtensiveProgram;
