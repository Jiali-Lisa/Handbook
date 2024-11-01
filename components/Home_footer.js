import React from "react";

function Home_footer() {
  return (
    <footer className="hp-footer">
      <div clasNames="footer-content">
        <div className="hp-acknowledgment">
          <p>We acknowledge and pay respect to the</p>
          <p>Traditional Owners of the lands upon</p>
          <p className="hp-ack">which our campuses are situated</p>
          <a href="https://www.unimelb.edu.au/reconciliation">
            Read about our commitment to reconciliation &gt;
          </a>
        </div>
        <div className="hp-footer-links">
          <div className="hp-footer-col">
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
                <a href="https://www.unimelb.edu.au/newsroom">Newsroom &gt;</a>
              </li>
              <li>
                <a href="https://www.unimelb.edu.au/contact">Contact &gt;</a>
              </li>
            </ul>
          </div>
          <div className="hp-footer-col">
            <p>Phone: 13 MELB (13 6352)</p>
            <p>International: +61 3 9035 5511</p>
            <p className="hp-address">Address:</p>
            <p className="hp-address">The University of Melbourne</p>
            <p className="hp-address">Grattan Street, Parkville,</p>
            <p className="hp-address">Victoria, 3010, Australia</p>
            <a href="https://about.unimelb.edu.au/priorities-and-partnerships/campus-development/campus-locations">
              View all Campus locations &gt;
            </a>
          </div>
          <div className="hp-footer-col">
            <div className="hp-bottom-logo">
              <a href="https://www.unimelb.edu.au">
                <img src="./Home_Page_img/UniLogo.png" alt="University Logo"/>
              </a>
            </div>
            <div className="hp-social-media">
              <a href="https://www.facebook.com/unimelb">
                <img src="./Home_Page_img/facebook-icon.png" alt="Facebook"/>
              </a>
              <a href="https://x.com/unimelb">
                <img src="./Home_Page_img/twitter-icon.png" alt="Twitter"/>
              </a>
              <a href="https://www.linkedin.com/school/university-of-melbourne/posts/?feedView=all">
                <img src="./Home_Page_img/linkedin-icon.png" alt="LinkedIn"/>
              </a>
              <a href="https://www.instagram.com/unimelb/">
                <img src="./Home_Page_img/instagram-icon.png" alt="Instagram"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Home_footer;
