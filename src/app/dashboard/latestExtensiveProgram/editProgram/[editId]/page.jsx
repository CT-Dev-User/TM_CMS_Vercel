'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

import Swal from 'sweetalert2';
import '../page.css';
import Link from 'next/link';
import { useAuth } from "@/app/contextApi/UserContext";
import dynamic from 'next/dynamic';


const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
})
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
  </div>
);
const EditExtensiveProgram = () => {
  const router = useRouter();
  const [userauth, setuserauth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { editId } = useParams()
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

  const headerTitleEditor = useRef(null);
  const headerSubTitleEditor = useRef(null);

  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push('/'); // Redirect to login page if not authenticated
    } else {
      const fetchCourseCategories = async () => {
        setLoading(true)
        try {
          const response = await axios.get('https://trialtmbackend.vercel.app/get-all-coursecategory');
          setCourseCategories(response.data);
          setLoading(false)
        } catch (err) {
          console.log(err);
        }
      };
      fetchCourseCategories();
      if (editId) {
        const fetchProgramData = async (id) => {
          setLoading(true)
          try {
            const response = await axios.get(`https://trialtmbackend.vercel.app/get-all-extensive-program-by-id/${id}`);
            const programData = response.data;
            setCourseCategory(programData.Category);
            setCardData(programData.cardData);
            setHeaderData(programData.headerData);
            setHighlights(programData.highlights);
            setCourseCurriculam(programData.courseCurriculam);
            setSkillYouLearn(programData.skillYouLearn);
            setTopInDemandTools(programData.topInDemandTools);
            setFeesStuctures(programData.FeesStuctures);
            setLoading(false)
          } catch (err) {
            console.error('Error fetching program data:', err);
          }
        };
        fetchProgramData(editId);
      }
    }
  }, [userauth, router, editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('Category', courseCategory);
    formData.append('cardData', JSON.stringify(cardData));
    formData.append('headerData', JSON.stringify(headerData));
    formData.append('highlights', JSON.stringify(highlights));
    formData.append('courseCurriculam', JSON.stringify(courseCurriculam));
    formData.append('skillYouLearn', skillYouLearn);
    formData.append('topInDemandTools', JSON.stringify(topInDemandTools));
    formData.append('FeesStuctures', JSON.stringify(FeesStuctures));

    if (headerImage) formData.append('headerImage', headerImage);
    for (const file of highlightsIcons) {
      formData.append('highlightsIcon', file);
    }
    for (const file of topInDemandToolsLogos) {
      formData.append('topInDemandToolsLogo', file);
    }

    try {
      await axios.put(`https://trialtmbackend.vercel.app/update-extensive-program-by-id/${editId}`, formData);
      Swal.fire('Success', 'program data updated successfully', 'success');
      router.push('/dashboard/latestExtensiveProgram/programTable');
    } catch (error) {
      console.error('Error updating form:', error);
    }
  };

  const handleInputChange = (e, section, index = null, subIndex = null) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      if (section === 'headerImage') setHeaderImage(files[0]);
      else if (section === 'highlightsIcons') setHighlightsIcons([...files]);
      else if (section === 'topInDemandToolsLogos') setTopInDemandToolsLogos([...files]);
    } else if (section === 'courseCategory') {
      setCourseCategory(value);
    } else if (section === 'cardData') {
      setCardData({ ...cardData, [name]: value });
    } else if (section === 'headerData') {
      setHeaderData({ ...headerData, [name]: value });
    } else if (section === 'highlights') {
      setHighlights({ ...highlights, [name]: value });
    } else if (section === 'courseCurriculam') {
      const updatedCurriculam = [...courseCurriculam];
      if (index !== null && subIndex !== null) {
        updatedCurriculam[index][name][subIndex] = value;
        setCourseCurriculam(updatedCurriculam);
      } else if (index !== null) {
        updatedCurriculam[index][name] = value;
        setCourseCurriculam(updatedCurriculam);
      }
    } else if (section === 'skillYouLearn') {
      setSkillYouLearn(value);
    } else if (section === 'topInDemandTools') {
      const updatedTools = [...topInDemandTools];
      if (index !== null) {
        updatedTools[index][name] = value;
        setTopInDemandTools(updatedTools);
      }
    } else if (section === 'FeesStuctures') {
      setFeesStuctures({ ...FeesStuctures, [name]: value });
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
    setHighlightsIcons(highlightsIcons.filter((_, i) => i !== index));
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
      { toolsName: '', logo: '' }
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
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white p-8 shadow-lg w-[70vw] text-black mt-2">
          <h2 className="text-3xl font-semibold mb-6 text-center">Edit Extensive Program</h2>
          <form onSubmit={handleSubmit} className="h-[70vh] overflow-y-auto custom-scrollbar text-black">
            <div className="mb-4">
              <label htmlFor="courseCategory" className="block text-sm font-medium text-gray-700">Course Category</label>
              <select
                id="courseCategory"
                name="courseCategory"
                value={courseCategory}
                onChange={(e) => handleInputChange(e, 'courseCategory')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Category</option>
                {courseCategories.map((category) => (
                  <option key={category._id} value={category.courseCategory}>{category.courseCategory}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="headerImage" className="block text-sm font-medium text-gray-700">Header Image</label>
              <input
                type="file"
                id="headerImage"
                name="headerImage"
                onChange={(e) => handleInputChange(e, 'headerImage')}
                className="mt-1 block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:font-semibold file:bg-gray-50 hover:file:bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Header Title</label>
              <JoditEditor
                ref={headerTitleEditor}
                value={headerData.headerTitle}
                onChange={(newContent) => setHeaderData({ ...headerData, headerTitle: newContent })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Header Subtitle</label>
              <JoditEditor
                ref={headerSubTitleEditor}
                value={headerData.headerSubTitle}
                onChange={(newContent) => setHeaderData({ ...headerData, headerSubTitle: newContent })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Highlights</label>
              <input
                type="text"
                name="title"
                value={highlights.title}
                onChange={(e) => handleInputChange(e, 'highlights')}
                placeholder="Title"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="text"
                name="subTitle"
                value={highlights.subTitle}
                onChange={(e) => handleInputChange(e, 'highlights')}
                placeholder="Subtitle"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="mt-4">
                {highlights.highlightPoints.map((point, index) => (
                  <div key={index} className="mb-2 flex flex-wrap items-center">
                    <input
                      type="text"
                      value={point.point}
                      onChange={(e) => handleInputChange(e, 'highlights', index)}
                      placeholder={`Highlight Point ${index + 1}`}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input type="file" name="" id="" onChange={(e) => handleInputChange(e, 'highlightsIcons', index)}
                      className="mt-1 block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:font-semibold file:bg-gray-50 hover:file:bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeHighlightPoint(index)}
                      className="ml-2 text-red-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHighlightPoint}
                  className="text-blue-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                >
                  Add Highlight Point
                </button>
              </div>
            </div>

            {/* Repeat similar structures for courseCurriculam, skillYouLearn, topInDemandTools, FeesStuctures */}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Course Curriculum</label>
              {courseCurriculam.map((curriculum, index) => (
                <div key={index} className="mb-4">
                  <input
                    type="text"
                    name="heading"
                    value={curriculum.heading}
                    onChange={(e) => handleInputChange(e, 'courseCurriculam', index)}
                    placeholder={`Curriculum Heading ${index + 1}`}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {curriculum.topic.map((topic, subIndex) => (
                    <div key={subIndex} className="mb-2 flex items-center">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => handleInputChange(e, 'courseCurriculam', index, subIndex)}
                        placeholder={`Topic ${subIndex + 1}`}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeTopic(index, subIndex)}
                        className="ml-2 text-red-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addTopic(index)}
                    className="mt-1 text-blue-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                  >
                    Add Topic
                  </button>
                  {curriculum.keyTakeways.map((keyTakeaway, subIndex) => (
                    <div key={subIndex} className="mb-2 flex items-center">
                      <input
                        type="text"
                        value={keyTakeaway}
                        onChange={(e) => handleInputChange(e, 'courseCurriculam', index, subIndex)}
                        placeholder={`Key Takeaway ${subIndex + 1}`}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeKeyTakeaway(index, subIndex)}
                        className="ml-2 text-red-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addKeyTakeaway(index)}
                    className="mt-1 text-blue-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                  >
                    Add Key Takeaway
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCurriculum(index)}
                    className="mt-2 text-red-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                  >
                    Remove Curriculum
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCurriculum}
                className="text-blue-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
              >
                Add Curriculum
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Top In Demand Tools</label>
              {topInDemandTools.map((tool, index) => (
                <div key={index} className="mb-4">
                  <input
                    type="text"
                    name="toolsName"
                    value={tool.toolsName}
                    onChange={(e) => handleInputChange(e, 'topInDemandTools', index)}
                    placeholder={`Tool Name ${index + 1}`}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <input
                    type="file"
                    name="logo"
                    onChange={(e) => handleInputChange(e, 'topInDemandToolsLogos', index)}
                    className="mt-1 block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:font-semibold file:bg-gray-50 hover:file:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeTopInDemandTool(index)}
                    className="mt-2 text-red-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTopInDemandTool}
                className="text-blue-500 border-2 border-gray-300 py-2 px-4 rounded-md shadow-sm block"
              >
                Add Tool
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Fee Structures</label>
              <div className="mb-2">
                <h3 className="text-lg font-semibold">On Time Payment</h3>
                <input
                  type="text"
                  name="discount"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'onTimePayment')}
                  placeholder="Discount"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="originalFees"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'onTimePayment')}
                  placeholder="Original Fees"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="duration"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'onTimePayment')}
                  placeholder="Duration"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-2">
                <h3 className="text-lg font-semibold">Monthly Payment</h3>
                <input
                  type="text"
                  name="discount"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'MonthlyPayment')}
                  placeholder="Discount"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="originalFees"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'MonthlyPayment')}
                  placeholder="Original Fees"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="duration"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'MonthlyPayment')}
                  placeholder="Duration"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mb-2">
                <h3 className="text-lg font-semibold">Scholarship</h3>
                <input
                  type="text"
                  name="discount"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'scollerShip')}
                  placeholder="Discount"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="originalFees"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'scollerShip')}
                  placeholder="Original Fees"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <input
                  type="text"
                  name="duration"
                  onChange={(e) => handleInputChange(e, 'FeesStuctures', 'scollerShip')}
                  placeholder="Duration"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mr-2 bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
            <button
              className="bg-gray-400 py-2 px-4 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Link
                href="/dashboard/latestExtensiveProgram/programTable"
              >
                Cancel
              </Link>
            </button>

          </form>
        </div>
      )}</>
  );
};

export default EditExtensiveProgram;
