"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdComputer, MdFormatQuote } from 'react-icons/md';
import {
  FaTrophy, FaAngleDown, FaAngleUp, FaUniversity, FaUsers, FaQuestionCircle,
  FaPhotoVideo, FaBlog, FaChalkboardTeacher, FaLightbulb, FaHandshake, FaCertificate,
  FaPhoneAlt, FaUserTie, FaBolt, FaUserTimes, FaAd, FaSignOutAlt, FaUser
} from 'react-icons/fa';
import './sidebar.css';
import { useAuth } from '@/app/contextApi/UserContext';
import { getUserRole } from '../utilityFunctions';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Sidebar = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [userauth, setuserauth] = useAuth();
  const userRole = getUserRole(userauth);

  // Check if the user is authenticated
  useEffect(() => {
    if (!userauth || !userauth.token) {
      router.push('/'); // Redirect to login page if not authenticated
    }
  }, [userauth, router]);

  // Read from localStorage on initial load
  useEffect(() => {
    const savedActiveItem = localStorage.getItem("activeItem");
    const savedOpenMenu = localStorage.getItem("openMenu");

    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }

    if (savedOpenMenu) {
      setOpenMenu(savedOpenMenu);
    }
  }, []);

  // Save to localStorage whenever activeItem or openMenu changes
  useEffect(() => {
    localStorage.setItem("activeItem", activeItem);
  }, [activeItem]);

  useEffect(() => {
    localStorage.setItem("openMenu", openMenu);
  }, [openMenu]);

  const roleBasedMenuItems = {
    1: [
      {
        title: "Users",
        list: [
          {
            title: "All users",
            path: "/dashboard/userRegistrations",
            icon: <FaUser />
          },
        ]
      },
      {
        title: "Course Category",
        list: [
          {
            title: "Courses",
            path: "/dashboard/latestCourseCategory/courseCategoryTable",
            icon: <MdComputer />
          },
        ]
      },
      {
        title: "Extensive Program",
        list: [
          {
            title: "Extensive Program",
            path: "/dashboard/latestExtensiveProgram/programTable",
            icon: <FaTrophy />
          },
          {
            title: "Students Review",
            path: "/dashboard/latestStudentReview",
            icon: <FaCertificate />
          },
          {
            title: "upcomming Batches",
            path: "/dashboard/latestExtensiveProgram/upcomingBatches",
            icon: <MdComputer />
          },
          {
            title: "Broucher",
            path: "/dashboard/latestExtensiveProgram/brocher",
            icon: <MdComputer />
          },
          {
            title: "Certificates",
            path: "/dashboard/latestCertificate",
            icon: <FaCertificate />
          },
          {
            title: "creators",
            path: "/dashboard/latestCreators",
            icon: <FaLightbulb />
          },
          {
            title: "instructors",
            path: "/dashboard/latestInstructors",
            icon: <FaChalkboardTeacher />
          }
        ]
      },
      {
        title: "Master Class",
        list: [
          {
            title: "Master Class Table",
            path: "/dashboard/latestMasterClass/latestMasterClassTable",
            icon: <FaChalkboardTeacher />
          }
        ]
      },
      {
        title: "Our Team",
        list: [
          {
            title: "team Members",
            path: "/dashboard/latestOurTeam",
            icon: <FaChalkboardTeacher />
          },
          {
            title: "Practioners",
            path: "/dashboard/latestPractioners",
            icon: <FaUserTimes />
          }
        ]
      },
      {
        title: "Testimonials",
        list: [
          {
            title: "Testimonials",
            path: "/dashboard/latestTestimonials",
            icon: <MdFormatQuote />
          },
          {
            title: "Alumni",
            path: "/dashboard/latestAlumni",
            icon: <FaAd />
          },
        ]
      },
      {
        title: "Collaborations",
        list: [
          {
            title: "Collaboration",
            path: "/dashboard/latestCollaboration/collaboration",
            icon: <FaUniversity />
          },
          {
            title: "Gallery",
            path: "/dashboard/latestCollaboration/gallery",
            icon: <FaPhotoVideo />
          }
        ]
      },
      {
        title: "Our Partner",
        list: [
          {
            title: "Our Partner",
            path: "/dashboard/latestOurPartner",
            icon: <FaUsers />
          },
        ]
      },
      {
        title: "Success Stories",
        list: [
          {
            title: "Success story",
            path: "/dashboard/latestSuccessStories",
            icon: <FaTrophy />
          }
        ]
      },
      {
        title: "Blogs",
        list: [
          {
            title: "Blogs",
            path: "/dashboard/latestBlogs",
            icon: <FaBlog />
          }
        ]
      },
      {
        title: "Hiring",
        list: [
          {
            title: "Hire From Us",
            path: "/dashboard/latestHirefromUs",
            icon: <FaAd />
          },
        ]
      },
      {
        title: "Crash Course",
        list: [
          {
            title: "Crash course",
            path: "/dashboard/latestCrashcourse",
            icon: <FaBolt />
          }
        ]
      },
      {
        title: "Contact Reports",
        list: [
          {
            title: "Contact Us Page",
            path: "/dashboard/latestContactUs/contactUSpage",
            icon: <FaPhoneAlt />
          },
          {
            title: "Enquiries",
            path: "/dashboard/latestContactUs/contactUsData",
            icon: <FaUserTie />
          },
          {
            title: "Consulting Enquiries",
            path: "/dashboard/latestContactUs/consultingData",
            icon: <FaUserTie />
          },
          {
            title: "Queries",
            path: "/dashboard/latestContactUs/queryData",
            icon: <FaUserTie />
          },
        ]
      },
      {
        title: "Batch Ad.",
        list: [
          {
            title: "Batches",
            path: "/dashboard/latestMorque",
            icon: <FaAd />
          },
        ]
      },
      {
        title: "All FAQ",
        list: [
          {
            title: "common FAQ",
            path: "/dashboard/latestAllFaq/commonFaq",
            icon: <FaQuestionCircle />
          },
          {
            title: "Category FAQ",
            path: "/dashboard/latestAllFaq/caotegoryFaq",
            icon: <FaQuestionCircle />
          },
        ]
      },
    ],
    2: [
      {
        title: "Course Category",
        list: [
          {
            title: "Courses",
            path: "/dashboard/latestCourseCategory/courseCategoryTable",
            icon: <MdComputer />
          },
        ]
      },
      {
        title: "Extensive Program",
        list: [
          {
            title: "Extensive Program",
            path: "/dashboard/latestExtensiveProgram/programTable",
            icon: <FaTrophy />
          },
          {
            title: "Students Review",
            path: "/dashboard/latestStudentReview",
            icon: <FaCertificate />
          },
          {
            title: "upcomming Batches",
            path: "/dashboard/latestExtensiveProgram/upcomingBatches",
            icon: <MdComputer />
          },
          {
            title: "Broucher",
            path: "/dashboard/latestExtensiveProgram/brocher",
            icon: <MdComputer />
          },
          {
            title: "Certificates",
            path: "/dashboard/latestCertificate",
            icon: <FaCertificate />
          },
          {
            title: "creators",
            path: "/dashboard/latestCreators",
            icon: <FaLightbulb />
          },
          {
            title: "instructors",
            path: "/dashboard/latestInstructors",
            icon: <FaChalkboardTeacher />
          }
        ]
      },
      {
        title: "Master Class",
        list: [
          {
            title: "Master Class Table",
            path: "/dashboard/latestMasterClass/latestMasterClassTable",
            icon: <FaChalkboardTeacher />
          }
        ]
      },
      {
        title: "Our Team",
        list: [
          {
            title: "team Members",
            path: "/dashboard/latestOurTeam",
            icon: <FaChalkboardTeacher />
          },
          {
            title: "Practioners",
            path: "/dashboard/latestPractioners",
            icon: <FaUserTimes />
          }
        ]
      },
      {
        title: "Testimonials",
        list: [
          {
            title: "Testimonials",
            path: "/dashboard/latestTestimonials",
            icon: <MdFormatQuote />
          },
          {
            title: "Alumni",
            path: "/dashboard/latestAlumni",
            icon: <FaAd />
          },
        ]
      },
      {
        title: "Collaborations",
        list: [
          {
            title: "Collaboration",
            path: "/dashboard/latestCollaboration/collaboration",
            icon: <FaUniversity />
          },
          {
            title: "Gallery",
            path: "/dashboard/latestCollaboration/gallery",
            icon: <FaPhotoVideo />
          }
        ]
      },
      {
        title: "Our Partner",
        list: [
          {
            title: "Our Partner",
            path: "/dashboard/latestOurPartner",
            icon: <FaUsers />
          },
        ]
      },
      {
        title: "Success Stories",
        list: [
          {
            title: "Success story",
            path: "/dashboard/latestSuccessStories",
            icon: <FaTrophy />
          }
        ]
      },
      {
        title: "Blogs",
        list: [
          {
            title: "Blogs",
            path: "/dashboard/latestBlogs",
            icon: <FaBlog />
          }
        ]
      },
      {
        title: "Hiring",
        list: [
          {
            title: "Hire From Us",
            path: "/dashboard/latestHirefromUs",
            icon: <FaAd />
          },
        ]
      },
      {
        title: "Crash Course",
        list: [
          {
            title: "Crash course",
            path: "/dashboard/latestCrashcourse",
            icon: <FaBolt />
          }
        ]
      },
      {
        title: "Contact Reports",
        list: [
          {
            title: "Contact Us Page",
            path: "/dashboard/latestContactUs/contactUSpage",
            icon: <FaPhoneAlt />
          },
          {
            title: "Enquiries",
            path: "/dashboard/latestContactUs/contactUsData",
            icon: <FaUserTie />
          },
          {
            title: "Consulting Enquiries",
            path: "/dashboard/latestContactUs/consultingData",
            icon: <FaUserTie />
          },
          {
            title: "Queries",
            path: "/dashboard/latestContactUs/queryData",
            icon: <FaUserTie />
          },
        ]
      },
      {
        title: "Batch Ad.",
        list: [
          {
            title: "Batches",
            path: "/dashboard/latestMorque",
            icon: <FaAd />
          },
        ]
      },
      {
        title: "All FAQ",
        list: [
          {
            title: "common FAQ",
            path: "/dashboard/latestAllFaq/commonFaq",
            icon: <FaQuestionCircle />
          },
          {
            title: "Category FAQ",
            path: "/dashboard/latestAllFaq/caotegoryFaq",
            icon: <FaQuestionCircle />
          },
        ]
      },
    ],
  };

  const handleItemClick = (path) => {
    setActiveItem(path);
  };

  const handleMenuClick = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to log out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Log out!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Make a request to the backend to log out
        axios.post("https://ot676akte0.execute-api.ap-south-1.amazonaws.com/dev/logout") // Adjust the URL as per your backend route
          .then((response) => {
            // Clear user authentication state and token from local storage
            setuserauth({ user: null, token: "" });
            localStorage.removeItem("auth");

            // Show success message
            Swal.fire({
              title: "Logged out successfully!",
              icon: "success",
            }).then(() => {
              router.push("/"); // Redirect to home or login page
            });
          })
          .catch((error) => {
            Swal.fire({
              title: "Logout failed",
              text: error.response?.data?.message || "An error occurred",
              icon: "error",
            });
          });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Logout canceled",
          icon: "info",
        });
      }
    });
  };

  // Return null if not authenticated to prevent rendering sidebar content
  if (!userauth || !userauth.token) {
    return null;
  }

  return (
    <div className='w-full h-screen bg-gray-100 p-4 overflow-y-auto custom-scrollbar'>
      <ul>
        {roleBasedMenuItems[userRole]?.map((item) => (
          <li key={item.title} className='mb-4'>
            <div
              className={`flex justify-between items-center text-md font-semibold text-slate-900 cursor-pointer ${openMenu === item.title ? 'bg-gray-300' : ''}`}
              onClick={() => handleMenuClick(item.title)}
            >
              <span>{item.title}</span>
              {openMenu === item.title ? <FaAngleUp /> : <FaAngleDown />}
            </div>
            {openMenu === item.title && (
              <ul className='mt-2'>
                {item.list.map((subItem) => (
                  <MenuLink
                    item={subItem}
                    key={subItem.title}
                    isActive={activeItem}
                    onItemClick={handleItemClick}
                  />
                ))}
              </ul>
            )}
          </li>
        ))}
        <li>
          <div className="text-red-800 hover:text-green-600 flex gap-2 items-center text-md font-semibold cursor-pointer" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>LogOut</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

const MenuLink = ({ item, isActive, onItemClick }) => {
  return (
    <li className={`mb-2 p-[5px] text-gray-700 hover:text-blue-500 ${isActive === item.path ? 'bg-slate-500 text-white' : ''}`}>
      <Link className="flex items-center" href={item.path} passHref onClick={() => onItemClick(item.path)}>
        {item.icon}
        <span className='ml-2'>{item.title}</span>
      </Link>
    </li>
  );
};

export default Sidebar;
