"use client";

// Import necessary components from react
import React, { useState, useEffect } from "react";
import './Home_Page.css';
import Home_side from "./Home_aside";
import Home_footer from "./Home_footer";
import { useRouter } from 'next/router';

// Home page
const Home_Page = () => {

  // Set variables 
  const router = useRouter();
  const [savedSearchWidth, setSavedSearchWidth] = useState("0");
  const [isFilterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterDetails, setFilterDetails] = useState("<p>Select a filter to view details</p>");
  const [filterIds] = useState([]);

  // For the saved search window to come out from the right side
  const toggleSavedSearchWindow = () => {
    setSavedSearchWidth(savedSearchWidth === "300px" ? "0px" : "300px");
  };

  // To close the saved search window 
  const closeSavedSearchWindow = () => {
    setSavedSearchWidth("0px");
  };

  // Filter window pop up function
  const toggleFilterPopup = () => {
    setFilterPopupVisible((prev) => !prev);
    if (!isFilterPopupVisible) {
      showFilterDetails();
    }
  };

  // Ensure this function only runs client-side, preventing export issues
  const [savedFilters, setSavedFilters] = useState([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFilters = getSavedFilters();
      setSavedFilters(storedFilters);
    }
  }, []);

  // To retrieve the selected filters from the localStorage
  const getSelectedFilters = () => {
    const filters = {};

    // Check each function options and collect each option that is checked
    const studyPeriods = Array.from(
      document.querySelectorAll('input[name="study-period"]:checked')
    ).map((checkbox) => checkbox.value);

    const courseTypes = Array.from(
      document.querySelectorAll('input[name="subject-level"]:checked')
    ).map((checkbox) => checkbox.value);

    const areaOfStudy = Array.from(
      document.querySelectorAll('input[name="study-area"]:checked')
    ).map((checkbox) => checkbox.value);

    const campuse = Array.from(
      document.querySelectorAll('input[name="campus-location"]:checked')
    ).map((checkbox) => checkbox.value);

    const capacity = Array.from(
      document.querySelectorAll('input[name="Quotas"]:checked')
    ).map((checkbox) => checkbox.value);

    // Add the checked filter options to the array "filters"
    if (studyPeriods) {
      filters.studyPeriod = [];
      studyPeriods.forEach((period) => {
        filters.studyPeriod.push(period);
      });
    }

    if (courseTypes) {
      filters.courseType = [];
      courseTypes.forEach((type) => {
        filters.courseType.push(type);
      });
    }
    if (areaOfStudy) {
      filters.areaOfStudy = [];
      areaOfStudy.forEach((type) => {
        filters.areaOfStudy.push(type);
      });
    }
    if (campuse) {
      filters.campus = [];
      campuse.forEach((mode) => {
        filters.campus.push(mode);
      });
    }

    if (capacity) {
      filters.capacity = [];
      capacity.forEach((mode) => {
        filters.capacity.push(mode);
      });
    }

    return filters;
  };

  // When a user clicks the save button, it saves the filter options to the localStorage
  const OnSaveClick = () => {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const newFilters = {}; 

    // Save checked state as "1" and unchecked one as "0"
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        newFilters[checkbox.id] = "1";
      } else {
        newFilters[checkbox.id] = "0"; 
      }
    });

    // Retrieve previously saved filters from localStorage
    let savedFilters = JSON.parse(localStorage.getItem("savedFilters")) || [];

    // If there are already 3 saved filters, remove the oldest one
    if (savedFilters.length >= 3) {
      savedFilters.shift();
    }
  
    // Add the new filters at the end of the array
    savedFilters.push(newFilters);
  
    // Save the updated array to localStorage
    localStorage.setItem("savedFilters", JSON.stringify(savedFilters));

    // Update the state with the saved filters
    setSavedFilters(savedFilters);
  };

  // Retrieve previously checked filter options from the saved filter
  const getSavedFilters = () => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("savedFilters")) || [];
    }
    return [];
  };

  // From the retrieved data from localStorage, apply the filter options onto the filter
  const applySavedFilters = (savedIdx) => {

    // Get every existing saved filters 
    const storedFilters = getSavedFilters();

    // Choose the one that is selected out of maximum three saved filter sets
    const filterToApply = storedFilters[savedIdx];

    if (filterToApply) {
      // Close the side window
      closeSavedSearchWindow();

      // Give some time to open the filter dropdown window
      setTimeout(() => {
        // Open the filter popup
        setFilterPopupVisible(true);
        // Show the filter details
        showFilterDetails();        
      }, 100); 

      // Apply previously saved filters on the filter dropdown
      applyFilters(filterToApply);
    } 
    else {
      alert("No saved filter found");
    }
  };

  // How to apply the filter options on the dropdown window based on the filterToApply object
  const applyFilters = (filterToApply) => {
    
    // Setting up an interval 
    const interval = setInterval(() => {
      let allCheckboxesFound = true;

      // If the checkbox exists then set its checked property based on the value from filterToApply
      Object.keys(filterToApply).forEach((filterId) => {
        const checkboxes = document.getElementById(filterId);
        if (checkboxes) {
          checkboxes.checked = filterToApply[filterId] === "1";
        } else {
          allCheckboxesFound = false;
        }
      });
      
      // Stop the interval if all checkboxes are found
      if (allCheckboxesFound) {
        clearInterval(interval); 
      }
    }, 100); 
  };

  // Display the saved filter buttons on the right side window
  const renderSavedFilters = () => {
    return savedFilters.map((filters, index) => (
      <button key={index} className="hp-saved-filter-button" onClick={() => applySavedFilters(index)}>
        Saved {index + 1}
      </button>
    ));
  };

  // Make the filter drop down depending on the isFilterPopupVisible status
  useEffect(() => {
    const filterPopup = window.document.getElementById("hp-filter-popup");
    if (filterPopup) {
      filterPopup.style.display = isFilterPopupVisible ? "flex" : "none";
    }
  }, [isFilterPopupVisible]);

  // Close filter window when clicking anywhere outside the filter window 
  useEffect(() => {
    const handleClickOutside = (event) => {
      /* If the filter is displayed and the user clicked outside of filter dropdown 
      or filter button, close the filter */
      if (
        isFilterPopupVisible &&
        !event.target.closest(".hp-filter-popup") &&
        !event.target.closest(".hp-filter-text")
      ) {
        setFilterPopupVisible(false);
      }

      // Get references to the saved search window and its open button
      const savedSearchWindow = window.document.getElementById("savedSearchWindow");
      const openButton = window.document.getElementById("openSavedSearch");

      // If the saved search window is open and the click occurred outside of the window, close the window
      if (
        savedSearchWindow &&
        !savedSearchWindow.contains(event.target) &&
        !openButton.contains(event.target)
      ) {
        closeSavedSearchWindow();
      }
    };
    // Detect the clicks anywhere 
    window.addEventListener("click", handleClickOutside);
    return () => {
      // Clear the event listener when the components unmounts or dependencies change
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isFilterPopupVisible]);

  // Show the details of each filter category
  const showFilterDetails = () => {
    const content = `
      <form>
      <div className="hp-filter-options">
        <div className="hp-filter-sticky">
        <h3 id='Subject Level'>Subject Level</h3><br>
        </div>
      </div>
          <div className='hp-label-details'>
            <input type="checkbox" id="all-undergrad" name="subject-level" value="All Undergraduate"/>
            <span>All Undergraduate</span>
          </div><br>
                          
          <div className='hp-label-details'>
              <input type="checkbox" id="all-grad" name="subject-level" value="All Graduate"/>
              <span>All Graduate</span>
          </div><br>
          
          <div className='hp-label-details'>
              <input type="checkbox" id="all-research" name="subject-level" value="All Research"/>
              <span>All Research</span>
          </div><br>
      <div className="hp-filter-options">                   
        <h3 id="Study Period">Study Period</h3><br>
      </div>
          <div className='hp-label-details'>
              <input type="checkbox" id="sem1" name="study-period" value="Semester 1">
              Semester 1
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="sem2" name="study-period" value="Semester 2">
              Semester 2
          </div><br>
          
          <div className='hp-label-details'>
              <input type="checkbox" id="summer-term" name="study-period" value="Summer Term">
              Summer Term
          </div><br>
          
          <div className='hp-label-details'>
              <input type="checkbox" id="winter-term" name="study-period" value="Winter Term">
              Winter Term
          </div><br>
      <div className="hp-filter-options">             
        <h3 id="Campus Location/Mode of Delivery">Campus Location/Mode of Delivery</h3><br>  
      </div>
          <div className='hp-label-details'>
              <input type="checkbox" id="parkville" name="campus-location" value="Parkville">
              Parkville
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Southbank" name="campus-location" value="Southbank">
              Southbank
          </div><br>
          
          <div className='hp-label-details'>
              <input type="checkbox" id="Burnley" name="campus-location" value="Burnley">
              Burnley
          </div><br>
                        
          <div className='hp-label-details'>
              <input type="checkbox" id="Creswick" name="campus-location" value="Creswick">
              Creswick
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Dookie" name="campus-location" value="Dookie">
              Dookie
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Hawthorn" name="campus-location" value="Hawthorn">
              Hawthorn
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Shepparton" name="campus-location" value="Shepparton">
              Shepparton
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Werribee" name="campus-location" value="Werribee">
              Werribee
          </div><br>
          <br>
          <div className='hp-label-details'>
              <input type="checkbox" id="off-campus" name="campus-location" value="Off Campus">
              Off Campus
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="online" name="campus-location" value="Online">
              Online
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Dual-Delivery" name="campus-location" value="Dual Delivery">
              Dual-Delivery
          </div><br>
      <div className="hp-filter-options"> 
        <h3 id="Areas of Study">Areas of Study</h3><br>
      </div>
          <div className='hp-label-details'>
              <input type="checkbox" id="Accounting" name="study-area" value="Accounting">
              Accounting (ACCT)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Agriculture" name="study-area" value="Agriculture">
              Agriculture (AGRI)
          </div><br>    
          <div className='hp-label-details'>
              <input type="checkbox" id="animalScience" name="study-area" value="Animal Science">
              Animal Science (ANSC)
          </div><br>  
          <div className='hp-label-details'>
              <input type="checkbox" id="abp" name="study-area" value="Architecture, Building & Planning">
              Architecture, Building & Planning (ABPL)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="Art History" name="study-area" value="Art History">
              Art History (AHIS)
          </div><br>   
          <div className='hp-label-details'>
              <input type="checkbox" id="arts" name="study-area" value="Arts">
              Arts (ARTS)
          </div><br>
                                              
          <div className='hp-label-details'>
              <input type="checkbox" id="biology" name="study-area" value="Biology">
              Biology (BIOL)
          </div><br>    
          <div className='hp-label-details'>
              <input type="checkbox" id="biomedicine" name="study-area" value="Biomedicine">
              Biomedicine (BIOM)
          </div><br>    
          <div className='hp-label-details'>
              <input type="checkbox" id="businessAdmin" name="study-area" value="Business Administration">
              Business Administration (BUSA)
          </div><br>    
        
          <div className='hp-label-details'>
              <input type="checkbox" id="Chemistry" name="study-area" value="Chemistry">
              Chemistry (CHEM)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="clinicalResearch" name="study-area" value="Clinical Research">
              Clinical Research (CLRS)
          </div><br>    
          <div className='hp-label-details'>
              <input type="checkbox" id="compSci" name="study-area" value="Computer Science">
              Computer Science (COMP)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="creativeArts" name="study-area" value="Creative Arts">
              Creative Arts (CREA)
          </div><br>

          <div className='hp-label-details'>
              <input type="checkbox" id="dentistry" name="study-area" value="Dentistry">
              Dentistry (DENT)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="design&productionStage" name="study-area" value="Design & Production for Stage & Screen">
              Design & Production for Stage & Screen (DPSS)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="devStudies" name="study-area" value="Development Studies">
              Development Studies (DEVT)
          </div><br>
                        
          <div className='hp-label-details'>
              <input type="checkbox" id="econometrics" name="study-area" value="Econometrics">
              Econometrics (ECOM)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="economics" name="study-area" value="Economics">
              Economics (ECON)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="education" name="study-area" value="Education">
              Education (EDUC)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="electricalEng" name="study-area" value="Electrical Engineering">
              Electrical Engineering (ELEN)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="envEng" name="study-area" value="Environmental Engineering">
              Environmental Engineering (ENEN)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="envStudies" name="study-area" value="Environmental Studies">
              Environmental Studies (ENST)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="envSci" name="study-area" value="Environmental Science">
              Environmental Science (EVSC)
          </div><br>

          <div className='hp-label-details'>
              <input type="checkbox" id="filmTV" name="study-area" value="Film and Television">
              Film and Television (FLTV)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="finance" name="study-area" value="Finance">
              Finance (FNCE)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="forestSci" name="study-area" value="Forest Sci">
              Forest Sci (FRST)
          </div><br>

          <div className='hp-label-details'>
              <input type="checkbox" id="geography" name="study-area" value="Geography">
              Geography (GEOG)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="geomatics" name="study-area" value="Geomatics">
              Geomatics (GEOM)
          </div><br>

          <div className='hp-label-details'>
              <input type="checkbox" id="law" name="study-area" value="Law">
              Law (LAWS)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="music" name="study-area" value="Music">
              Music (MUSI)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="nursing" name="study-area" value="Nursing Science">
              Nursing Science (NURS)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="psychology" name="study-area" value="Psychology">
              Psychology (PSYC)
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="vetSci" name="study-area" value="Veterinary Science">
              Veterinary Science (VETS)
          </div><br>
      <div className="hp-filter-options"> 
        <h3 id="Quotas">Quotas</h3><br>
      </div>
          <div className='hp-label-details'>
              <input type="checkbox" id="quotas" name="Quotas" value="Quotas">
              Subjects with quotas
          </div><br>
          <div className='hp-label-details'>
              <input type="checkbox" id="nonQuotas" name="Quotas" value="Without Quotas">
              Subjects without quotas
          </div><br>
        </form>`;
    // Display the filter details on the dropdown window
    setFilterDetails(content);
  };

  // Scroll to each filter section when the filter category clicked
  const scrollToSection = (sectionId) => {
    const detailsContainer = document.querySelector('.hp-filter-details');
    const section = document.getElementById(sectionId);
    
    // Scroll within the container, not the whole page
    if (detailsContainer && section) {
      detailsContainer.scrollTo({
        top: section.offsetTop, 
        behavior: 'smooth'
      });
    }
  };

  // Handles the whole search function
  const handleSearch = (searchValue) => {

    // Fetch selected filters options
    const filters = getSelectedFilters(); 

    // Check if the window is open
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams();

    // Append each filter options, each as a separate query parameter
    if (filters.studyPeriod) {
      filters.studyPeriod.forEach((period) => {
        queryParams.append("studyPeriod", period);
      });
    }

    if (filters.courseType) {
      filters.courseType.forEach((type) => {
        queryParams.append("courseType", type);
      });
    }
    if (filters.areaOfStudy) {
      filters.areaOfStudy.forEach((studyArea) => {
        queryParams.append("areaOfStudy", studyArea);
      });
    }
    if (filters.campus) {
      filters.campus.forEach((location) => {
        queryParams.append("campusLocationDeliveryMode", location);
      });
    }

    if (filters.capacity) {
      filters.capacity.forEach((capacity) => {
        queryParams.append("studyQuotas", capacity);
      });
    }

    // Link with the backend API
      router.push({
        pathname: `/search`,
        query: {
          q: searchValue || "",
          filters: filters.length > 0 ? JSON.stringify(filters) : null
        }
      });
    }
  };


  /* Scroll to top */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When the Top button is clicked, scroll to the top of the window
  useEffect(() => {
    const handleScroll = () => {
      const scrollToTopButton = document.getElementById('scrollToTop');

      // Make the button visible when the window is below certain level
      if (window.scrollY > 200) {
        scrollToTopButton.style.display = 'block';
      } else {
        scrollToTopButton.style.display = 'none';
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Return the home page with structure
  return (
    <div className="home-page">
      <div className="hp-container">
        <div className="hp-inner-container">
          <Home_side />
          <main className="hp-main-content">
            <section className="hp-search-section">
              <div className="hp-img-wrapper">
                <img src="./Home_Page_img/top.jpg" className="hp-pic" alt="Top Image"/>
              </div>
              <div className="hp-search-container">
                <input type="text" placeholder=" Enter subjects / major / ..." className="hp-search-bar"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e.target.value);
                    }
                  }}
                />
                
                <div className="hp-filter-text" onClick={toggleFilterPopup}>Filter</div>
                {isFilterPopupVisible && (
                  <div id="hp-filter-popup" className="hp-filter-popup">
                                     
                    <div className="hp-filter-options">
                      
                      <a href="#" className="hp-filter-options a"
                        onClick={() => scrollToSection("Subject Level")}>Subject Level</a>
                    
                      <a href="#" className="hp-filter-options a"
                        onClick={() => scrollToSection("Study Period")}>Study Period
                      </a>
                      <a
                        href="#" className="hp-filter-options a"
                        onClick={() => scrollToSection("Campus Location/Mode of Delivery")}>
                        Campus Location/Mode of Delivery
                      </a>
                      <a
                        href="#" className="hp-filter-options a"
                        onClick={() => scrollToSection("Areas of Study")}>
                        Areas of Study
                      </a>
                      
                      <a href="#" className="hp-filter-options a"
                        onClick={() => scrollToSection("Quotas")}>
                        Quotas
                      </a>
                    </div>
                    <div
                      className="hp-filter-details"
                      id="filterDetails"
                      dangerouslySetInnerHTML={{ __html: filterDetails }}
                      />
                    <button className="hp-save-button" id="saveButton" onClick={OnSaveClick}> Save </button>
                  </div>
                )}
                <button
                  className="hp-search-button"
                  onClick={() =>
                    handleSearch(document.querySelector(".hp-search-bar").value)
                  }
                >
                  Search
                </button>
                
              </div>
              <div className="hp-two-button">
                  <button className="hp-archive">Handbook Archive</button>
                  <button id="openSavedSearch" className="hp-saved-search-button" onClick={toggleSavedSearchWindow}>Saved Search</button>
              </div>
              <div className="hp-showonly">
                <span className="hp-word">Show Only: </span>
                <button className="hp-subject">Subjects</button>
                <button className="hp-courses">Courses</button>
                <button className="hp-breath-track">Breath Tracks</button>
              </div>
              <div className="hp-two-column-buttons">
                  <div className="hp-second-img-section">
                      <div className="hp-image-button">
                          <a href="https://students.unimelb.edu.au/your-course/manage-your-course/planning-your-course-and-subjects" className="hp-second-photo-item" target="_blank">
                              <img src='./Home_Page_img/planCourse.jpg' alt="Plan course and subjects" className="hp-second-img" />
                              <div className="hp-second-overlay-text">Plan your course and subjects</div>
                          </a>
                      </div>
                  </div>
                  <div className="hp-second-img-section">
                      <div className="hp-image-button">
                          <a href="https://study.unimelb.edu.au/support/faq" className="hp-second-photo-item" target="_blank">
                              <img src='./Home_Page_img/faq.png' alt="Frequently asked questions" className="hp-second-img" />
                              <div className="hp-second-overlay-text">Frequently asked questions</div>
                          </a>
                      </div>
                  </div>
              </div>
            </section>

            <div id="savedSearchWindow" className="hp-side-window" style={{ width: savedSearchWidth }}>
              <span className="hp-close-btn" onClick={closeSavedSearchWindow}>
                &times;
              </span>
              <p>This is the Saved Search window.</p>

              {savedFilters.length > 0 ? (
                <div className="hp-saved-filters">
                  {renderSavedFilters()}
                </div>
              ) : (
                <p>No saved filters yet.</p>
              )}
            </div>
          </main>
        </div>
        <Home_footer />
        <div className="hp-chatbot">
          <img src="./Home_Page_img/chatbot.png" alt="Instagram" />
        </div>
        <button id="scrollToTop" className="hp-scroll-to-top" onClick={scrollToTop} > ↑ Top </button>
      </div>
      <pre>{JSON.stringify(filterIds, null, 2)}</pre>
    </div>
  );
};
export default Home_Page;
