// Import necessary components
import Link from 'next/link';
import React, { useState, useEffect } from "react";
import "./Search_Page.css";
import { useRouter } from "next/router";


const Search_Page = () => {
  // Set variables
  const router = useRouter();
  const { q } = router.query;
  const [searchResult, setSearchResult] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterDetails, setFilterDetails] = useState(
    "<p>Select a filter to view details</p>"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [check, setCheck] = useState(0);

  // Set the search query
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    // Check if the query exists, call the handleSearch function, and set the result
    if (q) {
      const result = handleSearch(q);
      setSearchResult(result);
    }
    // Rerun the effect whenever the value of q changes
  }, [q]);


  useEffect(() => {
    attachSelectionEvents();
    // Empty dependency array ensures this runs only once when the component mounts
  }, []);


  // Discover the clicked filter options
  function attachSelectionEvents() {
    const options = document.querySelectorAll(".sp-filter-options a");

    options.forEach((option) => {
      option.addEventListener("click", function () {
        // Remove the selected class from all options
        options.forEach((opt) => opt.classList.remove("selected")); 
        // Add selected class to the clicked option
        this.classList.add("selected"); 
      });
    });
    return () => {
      options.forEach((option) => {
        option.removeEventListener("click", null);
      });
    };
  }


  // Handles overall search function
  const handleSearch = async (query) => {
    // Trim the search input
    if (typeof query == "string") {
      setSearchQuery(query.trim());
    }

    // Change the path name
    if (check != 0) {
      router.replace({
        pathname: "/search",
        query: { q: searchQuery },
      });
    } else {
      setCheck(1);
    }

    const filters = {};

    // If there is search input, check the filter options
    if (searchQuery) {
      filters.subjectNameOrCode = searchQuery;
    }
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

    if (studyPeriods) {
      filters.studyPeriod = [];
      studyPeriods.forEach((period) => {
        filters.studyPeriod.push(period);
      });
    }

    // Append selected filter options to the filters array
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

    const queryParams = new URLSearchParams();

    // Append subjectNameOrCode if present
    if (filters.subjectNameOrCode) {
      queryParams.append("subjectNameOrCode", filters.subjectNameOrCode);
    }

    // Append filter options, each as a separate query parameter
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

    try {
      //if searchQuery used. It return all subjects
      const response = await fetch(
        `https://it-handbook-77-backend-6241ffd82ea8.herokuapp.com/api/subjects/search?${queryParams}` 
      );

      const data = await response.json();

      if (data) {
        for (const subject of data) {
          if (subject.quotas == "N") {
            subject.quotas = "Do Not Apply ";
          } else {
            subject.quotas = "Apply";
          }
          // Fetch subject requisites
          const subjectRequisiteResponse = await fetch(
            `https://it-handbook-77-backend-6241ffd82ea8.herokuapp.com/api/search/requisites/${subject.subject_code}` 
          );
          const requisiteData = await subjectRequisiteResponse.json();

          if (subject.pre_requisite == "Y") {
            // Adjust prerequsite
            if (!requisiteData || !requisiteData.prerequisites) {
              subject.pre_requisite =
                "Please check with the subject coordinator";
            } else {
              // Extract and clean prerequisite data
              const cleanedPrerequisites = requisiteData.prerequisites
                .replace(/\n+/g, " ") // Replace multiple newlines with spaces
                .replace(/\s\s+/g, " ") // Replace multiple spaces with a single space
                .replace(/Code\sName\sTeaching\speriod\sCredit\sPoints\s+/g, "")
                .trim();

              subject.pre_requisite = cleanedPrerequisites;
            }
          } else {
            subject.pre_requisite = "Requisites Do Not Apply";
          }
          // Fetch subject requisites
          const subjectNotAllow = await fetch(
            `https://it-handbook-77-backend-6241ffd82ea8.herokuapp.com/api/search/notAllowed/${subject.subject_code}` 
          );
          const notAllowedData = await subjectNotAllow.json();
          // Dynamically adding non_allowed_subjects to the subject object
          subject.non_allowed_subjects = notAllowedData.map(
            (item) => item.non_allowed_subject
          );

          if (subject.non_allowed_subjects == "") {
            subject.non_allowed_subjects = "Do Not Apply";
          }
        }
        setSearchResults(data);
      } else {
        alert("Subject not found");
      }
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  // Toggle overlay visibility
  const toggleOverlay = () => {
    setOverlayVisible((prev) => !prev);
  };

  /* For the filter window below search bar */
  const toggleFilterPopup = () => {
    setFilterPopupVisible((prev) => !prev);
    if (!filterPopupVisible) {
      showFilterDetails();
    }
  };
  // Make the filter popup
  useEffect(() => {
    const filterPopup = document.getElementById("filterPopup");
    if (filterPopup) {
      filterPopup.style.display = filterPopupVisible ? "flex" : "none";
    }
  }, [filterPopupVisible]);

  // Display the details of filter
  const showFilterDetails = () => {
    const content = `
      <form>
      <div className="sp-filter-options">
        <div className="sp-filter-sticky">
          <h3 id='Subject Level'>Subject Level</h3><br>
        </div>
      </div>
          <div className='sp-label-details'>
            <input type="checkbox" id="all-undergrad" name="subject-level" value="Undergraduate"/>
            <span>All Undergraduate</span>
          </div><br>
                          
          <div className='sp-label-details'>
              <input type="checkbox" id="all-grad" name="subject-level" value="Graduate coursework"/>
              <span>All Graduate</span>
          </div><br>

          <div className='sp-label-details'>
              <input type="checkbox" id="all-honours" name="subject-level" value="Honours"/>
              <span>All Honours</span>
          </div><br>
          
          <div className='sp-label-details'>
              <input type="checkbox" id="all-research" name="subject-level" value="research"/>
              <span>All Research</span>
          </div><br>
      <div className="sp-filter-options">                   
        <h3 id="Study Period">Study Period</h3><br>
      </div>
          <div className='sp-label-details'>
              <input type="checkbox" id="sem1" name="study-period" value="Semester 1">
              Semester 1
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="sem2" name="study-period" value="Semester 2">
              Semester 2
          </div><br>
          
          <div className='sp-label-details'>
              <input type="checkbox" id="summer-term" name="study-period" value="Summer Term">
              Summer Term
          </div><br>
          
          <div className='sp-label-details'>
              <input type="checkbox" id="winter-term" name="study-period" value="Winter Term">
              Winter Term
          </div><br>
      <div className="sp-filter-options">             
        <h3 id="Campus Location/Mode of Delivery">Campus Location/Mode of Delivery</h3><br>  
      </div>
          <div className='sp-label-details'>
              <input type="checkbox" id="parkville" name="campus-location" value="Parkville">
              Parkville
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Southbank" name="campus-location" value="Southbank">
              Southbank
          </div><br>
          
          <div className='sp-label-details'>
              <input type="checkbox" id="Burnley" name="campus-location" value="Burnley">
              Burnley
          </div><br>
                        
          <div className='sp-label-details'>
              <input type="checkbox" id="Creswick" name="campus-location" value="Creswick">
              Creswick
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Dookie" name="campus-location" value="Dookie">
              Dookie
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Hawthorn" name="campus-location" value="Hawthorn">
              Hawthorn
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Shepparton" name="campus-location" value="Shepparton">
              Shepparton
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Werribee" name="campus-location" value="Werribee">
              Werribee
          </div><br>
          <br>
          <div className='sp-label-details'>
              <input type="checkbox" id="off-campus" name="campus-location" value="Off Campus">
              Off Campus
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="online" name="campus-location" value="Online">
              Online
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Dual-Delivery" name="campus-location" value="Dual Delivery">
              Dual-Delivery
          </div><br>
      <div className="sp-filter-options"> 
        <h3 id="Areas of Study">Areas of Study</h3><br>
      </div>
          <div className='sp-label-details'>
              <input type="checkbox" id="Accounting" name="study-area" value="Accounting">
              Accounting (ACCT)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Agriculture" name="study-area" value="Agriculture">
              Agriculture (AGRI)
          </div><br>    
          <div className='sp-label-details'>
              <input type="checkbox" id="animalScience" name="study-area" value="Animal Science">
              Animal Science (ANSC)
          </div><br>  
          <div className='sp-label-details'>
              <input type="checkbox" id="abp" name="study-area" value="Architecture, Building & Planning">
              Architecture, Building & Planning (ABPL)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="Art History" name="study-area" value="Art History">
              Art History (AHIS)
          </div><br>   
          <div className='sp-label-details'>
              <input type="checkbox" id="arts" name="study-area" value="Arts">
              Arts (ARTS)
          </div><br>
                                              
          <div className='sp-label-details'>
              <input type="checkbox" id="biology" name="study-area" value="Biology">
              Biology (BIOL)
          </div><br>    
          <div className='sp-label-details'>
              <input type="checkbox" id="biomedicine" name="study-area" value="Biomedicine">
              Biomedicine (BIOM)
          </div><br>    
          <div className='sp-label-details'>
              <input type="checkbox" id="businessAdmin" name="study-area" value="Business Administration">
              Business Administration (BUSA)
          </div><br>    
        
          <div className='sp-label-details'>
              <input type="checkbox" id="Chemistry" name="study-area" value="Chemistry">
              Chemistry (CHEM)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="clinicalResearch" name="study-area" value="Clinical Research">
              Clinical Research (CLRS)
          </div><br>    
          <div className='sp-label-details'>
              <input type="checkbox" id="compSci" name="study-area" value="Computer Science">
              Computer Science (COMP)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="creativeArts" name="study-area" value="Creative Arts">
              Creative Arts (CREA)
          </div><br>

          <div className='sp-label-details'>
              <input type="checkbox" id="dentistry" name="study-area" value="Dentistry">
              Dentistry (DENT)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="design&productionStage" name="study-area" value="Design & Production for Stage & Screen">
              Design & Production for Stage & Screen (DPSS)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="devStudies" name="study-area" value="Development Studies">
              Development Studies (DEVT)
          </div><br>
                        
          <div className='sp-label-details'>
              <input type="checkbox" id="econometrics" name="study-area" value="Econometrics">
              Econometrics (ECOM)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="economics" name="study-area" value="Economics">
              Economics (ECON)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="education" name="study-area" value="Education">
              Education (EDUC)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="electricalEng" name="study-area" value="Electrical Engineering">
              Electrical Engineering (ELEN)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="envEng" name="study-area" value="Environmental Engineering">
              Environmental Engineering (ENEN)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="envStudies" name="study-area" value="Environmental Studies">
              Environmental Studies (ENST)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="envSci" name="study-area" value="Environmental Science">
              Environmental Science (EVSC)
          </div><br>

          <div className='sp-label-details'>
              <input type="checkbox" id="filmTV" name="study-area" value="Film and Television">
              Film and Television (FLTV)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="finance" name="study-area" value="Finance">
              Finance (FNCE)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="forestSci" name="study-area" value="Forest Sci">
              Forest Sci (FRST)
          </div><br>

          <div className='sp-label-details'>
              <input type="checkbox" id="geography" name="study-area" value="Geography">
              Geography (GEOG)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="geomatics" name="study-area" value="Geomatics">
              Geomatics (GEOM)
          </div><br>

          <div className='sp-label-details'>
              <input type="checkbox" id="law" name="study-area" value="Law">
              Law (LAWS)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="music" name="study-area" value="Music">
              Music (MUSI)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="nursing" name="study-area" value="Nursing Science">
              Nursing Science (NURS)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="psychology" name="study-area" value="Psychology">
              Psychology (PSYC)
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="vetSci" name="study-area" value="Veterinary Science">
              Veterinary Science (VETS)
          </div><br>
      <div className="sp-filter-options"> 
        <h3 id="Quotas">Quotas</h3><br>
      </div>
          <div className='sp-label-details'>
              <input type="checkbox" id="quotas" name="Quotas" value="Y">
              Subjects with quotas
          </div><br>
          <div className='sp-label-details'>
              <input type="checkbox" id="nonQuotas" name="Quotas" value="N">
              Subjects without quotas
          </div><br>
        </form>`;

    setFilterDetails(content);
  };

  // Scroll to each filter category when clicked
  const scrollToSection = (sectionId) => {
    const detailsContainer = document.querySelector(".sp-filter-details");
    const section = document.getElementById(sectionId);

    if (detailsContainer && section) {
      // Scroll within the container, not the whole page
      detailsContainer.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Handle outside click for overlay and filter popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check for overlay close
      if (overlayVisible && event.target.id === "searchOverlay") {
        setOverlayVisible(false);
      }
      // Check for filter popup close
      if (
        filterPopupVisible &&
        !event.target.closest(".sp-filter-popup") &&
        !event.target.closest(".sp-filter-text")
      ) {
        setFilterPopupVisible(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [overlayVisible, filterPopupVisible]);

  // Scroll to the top of the window
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  useEffect(() => {
    const handleScroll = () => {
      const scrollToTopButton = document.getElementById("scrollToTop");
      // Let the top button appear if the user goes down to the certain level
      if (window.scrollY > 200) {
        scrollToTopButton.style.display = "block";
      } else {
        scrollToTopButton.style.display = "none";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Subject page structure
  return (
    <div className="search-page">
      <header>
        <a
          className="sp-logo"
          href="https://www.unimelb.edu.au"
          aria-label="The University of Melbourne homepage"
        >
          <img
            src="./Search_Page_img/UniLogo.png"
            alt="University Logo"
            className="sp-logo"
          />
        </a>
        <span className="sp-direction">
          <Link href="/home" style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>{" "}
          &gt; Search
        </span>
        <span className="sp-search" onClick={toggleOverlay}>
          Search
        </span>
      </header>

      {overlayVisible && (
        <div className="sp-overlay" id="searchOverlay">
          <div className="sp-search-box">
            <input
              type="text"
              placeholder="Enter subjects / major / ..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e.target.value);
                }
              }}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </div>
      )}

      <section className="sp-search-section">
        <div className="sp-search-container">
          <input
            type="text"
            placeholder="Enter subjects / major / ..."
            className="sp-search-bar"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e.target.value);
              }
            }}
          />
          <span className="sp-filter-text" onClick={toggleFilterPopup}>
            Filter
          </span>

          {filterPopupVisible && (
            <div id="sp-filter-popup" className="sp-filter-popup">
              <div className="sp-filter-options">
                <a
                  href="#"
                  className="sp-filter-options-link"
                  onClick={() => scrollToSection("Subject Level")}
                >
                  Subject Level
                </a>
                <a
                  href="#"
                  className="sp-filter-options-link"
                  onClick={() => scrollToSection("Study Period")}
                >
                  Study Period
                </a>
                <a
                  href="#"
                  className="sp-filter-options-link"
                  onClick={() =>
                    scrollToSection("Campus Location/Mode of Delivery")
                  }
                >
                  Campus Location/Mode of Delivery
                </a>
                <a
                  href="#"
                  className="sp-filter-options-link"
                  onClick={() => scrollToSection("Areas of Study")}
                >
                  Areas of Study
                </a>
                <a
                  href="#"
                  className="sp-filter-options-link"
                  onClick={() => scrollToSection("Quotas")}
                >
                  Quotas
                </a>
              </div>
              <div
                className="sp-filter-details"
                id="filterDetails"
                dangerouslySetInnerHTML={{ __html: filterDetails }}
              />
            </div>
          )}

          <button className="sp-search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </section>

      <section className="sp-results">
        <div className="sp-result-number">
          <span>
            {searchResults.length} results of &quot;{searchQuery}&quot; found
          </span>
        </div>
        {searchResults.map((result, index) => (
          <div
            className="sp-result-bar"
            key={index}
            onClick={() => router.push(`/subjects/${result.subject_code}`)}
          >
            <h3>
              {result.subject_name} ({result.subject_code})
            </h3>
            <p>
              Available at {result.campus} during {result.offer_time}
            </p>
            <p>
              {result.course_type} subject under the {result.area_of_study}
            </p>
            <div className="sp-requirements">
              <div className="sp-prereq" data-content={result.pre_requisite}>
                Prerequisites
              </div>
              <div className="sp-quota" data-content={result.quotas}>
                Quotas Apply
              </div>
              <div
                className="sp-non-allow"
                data-content={result.non_allowed_subjects}
              >
                Non-allow subjects
              </div>
            </div>
          </div>
        ))}
      </section>

      <footer className="sp-footer">
        <div className="sp-footer-content">
          <div className="sp-acknowledgment">
            <p>
              We acknowledge and pay respect to the
              <br />
              Traditional Owners of the lands upon
              <br />
              which our campuses are situated
            </p>
            <a href="https://www.unimelb.edu.au/reconciliation">
              Read about our commitment to reconciliation &gt;
            </a>
          </div>
          <div className="sp-footer-links">
            <div className="sp-footer-col">
              <ul>
                <li>
                  <a href="https://about.unimelb.edu.au/">About us &gt;</a>
                </li>
                <li>
                  <a href="https://about.unimelb.edu.au/careers">
                    Careers at Melbourne &gt;
                  </a>
                </li>
                <li>
                  <a href="https://www.unimelb.edu.au/respect">
                    Safety and respect &gt;
                  </a>
                </li>
                <li>
                  <a href="https://www.unimelb.edu.au/newsroom">
                    Newsroom &gt;
                  </a>
                </li>
                <li>
                  <a href="https://www.unimelb.edu.au/contact">Contact &gt;</a>
                </li>
              </ul>
            </div>
            <div className="sp-footer-col">
              <p>Phone: 13 MELB (13 6352)</p>
              <p>International: +61 3 9035 5511</p>
              <p>
                Address:
                <br />
                The University of Melbourne
                <br />
                Grattan Street, Parkville,
                <br />
                Victoria, 3010, Australia
              </p>
              <a href="https://about.unimelb.edu.au/priorities-and-partnerships/campus-development/campus-locations">
                View all Campus locations &gt;
              </a>
            </div>

            <div className="sp-footer-col">
              <img
                src="./Search_Page_img/UniLogo.png"
                href="https://www.unimelb.edu.au"
                alt="University Logo"
                className="sp-bottom-logo"
              />
              <div className="sp-social-media">
                <a href="https://www.facebook.com/unimelb">
                  <img
                    src="./Search_Page_img/facebook-icon.png"
                    alt="Facebook"
                  />
                </a>
                <a href="https://x.com/unimelb">
                  <img src="./Search_Page_img/twitter-icon.png" alt="Twitter" />
                </a>
                <a href="https://www.linkedin.com/school/university-of-melbourne/posts/?feedView=all">
                  <img
                    src="./Search_Page_img/linkedin-icon.png"
                    alt="LinkedIn"
                  />
                </a>
                <a href="https://www.instagram.com/unimelb/">
                  <img
                    src="./Search_Page_img/instagram-icon.png"
                    alt="Instagram"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div className="sp-chatbot">
        <img src="./Search_Page_img/chatbot.png" alt="Chatbot" />
      </div>
      <button
        id="scrollToTop"
        className="sp-scroll-to-top"
        onClick={scrollToTop}
        style={{ display: "none" }}
      >
        ↑ Top
      </button>
    </div>
  );
};

export default Search_Page;
