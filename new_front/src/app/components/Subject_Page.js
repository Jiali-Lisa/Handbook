import Link from 'next/link';
import React, { useState, useEffect } from "react";
import "./Subject_Page.css";

const Subject_Page = ({ subjectCode }) => {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subjectInfo, setSubjectInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  //fetch from api
  const fetchSubjectInfo = async (code) => {
    try {
      const response = await fetch(
        `https://it-handbook-77-backend-6241ffd82ea8.herokuapp.com/api/subjects/${code}`
      ); // Adjust the API endpoint as necessary

      const data = await response.json();
      setSubjectInfo(data);
    } catch (error) {
      console.error("Error fetching subject info:", error);
    } finally {
      setLoading(false); // Set loading to false once fetch is done
    }
  };

  useEffect(() => {
    fetchSubjectInfo(subjectCode);
  }, [subjectCode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.id === "searchOverlay") {
        setOverlayVisible(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollToTopButton = document.getElementById("scrollToTop");
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

  useEffect(() => {
    const anchors = document.querySelectorAll(".subp-sidebar a");
    const handleClick = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          top: "section.offsetTop",
          behavior: "smooth",
          block: "top",
          inline: "nearest",
        });
      }
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", handleClick);
    });

    return () => {
      anchors.forEach((anchor) => {
        anchor.removeEventListener("click", handleClick);
      });
    };
  }, []);

  if (loading) {
    return <div>Loading subject information...</div>;
  }

  //This function was inspired by chatGTP (chatGTP was used for debugging and providing solution)
  //the function split the assesment into indivial assesment (Description, timing and percentage)
  function splitAssessment(assessmentString) {
    if (typeof assessmentString !== "string") {
      console.error("Invalid input: assessmentString should be a string");
      return [];
    }
    const assessmentsArray = assessmentString
      .split("Additional details")[0]
      .trim()
      .split("\n\n")
      .map(function (section) {
        let descriptionMatch = section.match(/Description:(.*)/);
        let hurdle = "";
        const timeMatch = section.match(/Time:(.*)/);
        const percentageMatch = section.match(/Percentage:(.*)/);

        if (descriptionMatch) { //handle hurdle 
          if (descriptionMatch[1].includes("*Hurdle requirement:")) {
            let splitStr = descriptionMatch[1].split(/\*Hurdle requirement/);
            descriptionMatch[1] = splitStr[0].trim();
            hurdle = splitStr[1].trimEnd();
          }
        }
        // Return an object for each assessment containing description, time, and percentage
        const result = {
          description: descriptionMatch ? descriptionMatch[1] : "",
          time: timeMatch ? timeMatch[1].trim() : "",
          percentage: percentageMatch ? percentageMatch[1].trim() : "",
          hurdle,
        };
        return result;
      });
    return assessmentsArray;
  }

  //the function extract for additional details from assessment 
  function extractAdditional(assessmentString) {
    if (typeof assessmentString !== "string") {
      console.error("Invalid input: assessmentString should be a string");
      return [];
    }
    const additionalInfoSection = assessmentString
      .split("Additional details:")[1]
      ?.trim();
    if (!additionalInfoSection) {
      return "No additional information available";
    }
    return additionalInfoSection;
  }

  const { subject_detail, subjects_not_allowed, subject_core } =
    subjectInfo || {};

  const {
    subject_name,
    subject_code,
    overview,
    intended_lO,
    generic_skill,
    prerequisites,
    inherent_requirements,
    assessment,
    dates_times_Time_commitment_details_What_do_these_dates_mean,
  } = subject_detail || {};

  //format for intened learning outcome
  function listFormatV1(text) { 
    if (typeof text !== "string") {
      return [];
    }
    return text.replace(/-/g, "").trim().split("\n");
  }

  //format for generic skill 
  function listFormatV2(text) {
    if (typeof text !== "string") {
      return [];
    }
    text = text.replace(/_x000D_/g, "");
    return text.replace(/-/g, "").trim().split("\n\n");
  }
  
  //format the information meaning 
  function meaningTextFormat(input) {
    if (typeof input !== "string") {
      return [];
    }
    let reformatString = input.replace("-", "\n").trim();
    return reformatString;
  }

  /*split the date & time section into date&time, 
    time commitment and what does thsi mean*/
  function splitDateInfo(dateString) {
    if (typeof dateString !== "string") {
      console.error("Invalid input: should be a string");
      return [];
    }
    const dateAndTimeMatch = dateString.match(
      /Dates & times:\s*([\s\S]*?)\n\n/
    );
    const timeCommitMatch = dateString.match(
      /Time commitment details:\s*([\s\S]*?)\n\n/
    );
    const infoMeaningMatch = dateString.match(
      /What do these dates mean:\s*([\s\S]*?)\n\n\n\n/
    );

    const dateAndTime = dateAndTimeMatch
      ? dateAndTimeMatch[1].trim()
      : "Not available";
    const timeCommit = timeCommitMatch
      ? timeCommitMatch[1].trim()
      : "Not available";
    const infoMeaning = infoMeaningMatch
      ? meaningTextFormat(infoMeaningMatch[1].trim())
      : "Not available";

    return {
      dateAndTime,
      timeCommit,
      infoMeaning,
    };
  }

  //reformat everything by calling function
  const assessments = splitAssessment(assessment);
  const timeDetail = splitDateInfo(
    dates_times_Time_commitment_details_What_do_these_dates_mean
  );
  const additionalDetail = extractAdditional(assessment);
  const intendedIOReformat = listFormatV1(intended_lO);
  const genericSkillReformat = listFormatV2(generic_skill);

  function showNewLine(input) {
    if (typeof input !== "string") {
      return [];
    }
    return input.split("\n");
  }

  return (
    <div>
      <div class="subp-header">
        <a
          className="subp-logo"
          href="https://www.unimelb.edu.au"
          ria-label="The University of Melbourne homepage"
        >
          <img
            src="/Subject_Page_img/UniLogo.png"
            alt="University Logo"
            className="subp-logo"
          />
        </a>
        <span className="subp-direction">
          <Link href="/home" style={{ color: "white", textDecoration: "none" }}>
            Home{" "}
          </Link>{" "}
          &gt;
          <Link href="/search" style={{ color: "white", textDecoration: "none" }}>
            {" "}
            Search{" "}
          </Link>{" "}
          &gt; {subject_name} ({subject_code})
        </span>
        <span className="subp-search" onClick={toggleOverlay}>
          Search
        </span>
      </div>

      {overlayVisible && (
        <div className="subp-overlay" id="searchOverlay">
          <div className="subp-search-box">
            <input type="text" placeholder="Enter subjects / major / ..." />
            <button>Search</button>
          </div>
        </div>
      )}

      <section className="subp-title">
        <div className="subp-subject-wrapper">
          <span className="subp-subjectname">
            {subject_name + " " + "(" + subject_code + ")"}
          </span>
          <span className="subp-dates">↳ Dates and times</span>
        </div>
      </section>

      <div className="subp-middle">
        <button
          className="subp-toggle-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {" "}
          ☰{" "}
        </button>
        <div className={`subp-sidebar ${sidebarOpen ? "open" : ""}`}>
          <ul>
            <p>
              <a href="#overview">• Overview</a>
            </p>
            <p>
              <a href="#eligibility">• Eligibility and Requirements</a>
            </p>
            <p>
              <a href="#assessment">• Assessment</a>
            </p>
            <p>
              <a href="#additional">• Additional Details</a>
            </p>
            <p>
              <a href="#dates">• Dates and Times</a>
            </p>
            <p>
              <a href="#commitment">• Time Commitment Details</a>
            </p>
            <p>
              <a href="#meaning">• More Information</a>
            </p>
            
          </ul>
        </div>
        <div className="subp-container">
          <div
            className={`${
              sidebarOpen
                ? "subp-main-content-sidebar-open"
                : "subp-main-content"
            }`}
          >
            <h1 id="overview">Overview</h1>
            <p>{overview || "No overview available"}</p>
            <h1 id="eligibility">Eligibility and Requirements</h1>
            <p className="subp-inner">
              {prerequisites || "No prerequisite subjects are needed."}
            </p>
            <h1 id="assessment">Assessment</h1>
            <ul>
              {assessments.map((assessment, index) => (
                <li key={index}>
                  <p>
                    <strong>Description:</strong> {assessment.description}
                  </p>
                  <p>
                    <strong>Time:</strong> {assessment.time}
                  </p>
                  <p>
                    <strong>Percentage:</strong> {assessment.percentage}
                  </p>
                  <p>
                    <strong>Please Note:</strong>{" "}
                    {assessment.hurdle || "Not applied"}
                  </p>
                </li>
              ))}
            </ul>
            <h1 id="additional">Additional details</h1>
            <p>{additionalDetail}</p>
            <h1 id="dates">Dates and Times</h1>
            <p>
              {showNewLine(timeDetail.dateAndTime).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </p>
            <h1 id="commitment">Time commitment details</h1>
            <p>{timeDetail.timeCommit}</p>
            <h1 id="meaning">What do these dates mean</h1>
            <p>{timeDetail.infoMeaning}</p>

            <h1 id="intended_IO">Intended Learning Outcome</h1>
            <ul>
              {intendedIOReformat.map((sub, index) => (
                <li key={index}>{sub}</li>
              ))}
            </ul>

            <h1 id="generic">Generic Skill</h1>
            <ul>
              {genericSkillReformat.map((sub, index) => (
                <li key={index}>{sub}</li>
              ))}
            </ul>

            <h1 id="Inherent_Requirement">Inherent Requirement</h1>
            <p>{inherent_requirements}</p>

            <h1 id="Core">Corequisites</h1>
            <p>{subject_core || "None"}</p>

            <h1 id="Non-allowed">Non-allowed subjects</h1>
            <p>{subjects_not_allowed || "None"}</p>
          </div>
        </div>
      </div>

      <footer className="subp-footer">
        <div className="subp-footer-content">
          <div className="subp-acknowledgment">
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
          <div className="subp-footer-links">
            <div className="subp-footer-col">
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
            <div className="subp-footer-col">
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
            <div className="subp-footer-col">
              <img
                src="/Subject_Page_img/UniLogo.png"
                href="https://www.unimelb.edu.au"
                alt="University Logo"
                className="subp-bottom-logo"
              />
              <div className="subp-social-media">
                <a href="https://www.facebook.com/unimelb">
                  <img
                    src="/Subject_Page_img/facebook-icon.png"
                    alt="Facebook"
                  />
                </a>
                <a href="https://x.com/unimelb">
                  <img src="/Subject_Page_img/twitter-icon.png" alt="Twitter" />
                </a>
                <a href="https://www.linkedin.com/school/university-of-melbourne/posts/?feedView=all">
                  <img
                    src="/Subject_Page_img/linkedin-icon.png"
                    alt="LinkedIn"
                  />
                </a>
                <a href="https://www.instagram.com/unimelb/">
                  <img
                    src="/Subject_Page_img/instagram-icon.png"
                    alt="Instagram"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div className="subp-chatbot">
        <img src="/Subject_Page_img/chatbot.png" alt="Chatbot" />
      </div>
      <button
        id="scrollToTop"
        className="subp-scroll-to-top"
        onClick={scrollToTop}
        style={{ display: "none" }}
      >
        ↑ Top
      </button>
    </div>
  );
};

export default Subject_Page;
