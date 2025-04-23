import React from 'react'

function Home_side() {
    return (
        <aside className="hp-sidebar">
            <a className="hp-logo" href="https://www.unimelb.edu.au" aria-label="The University of Melbourne homepage">
                <img src='./Home_Page_img/dark.png' alt="University Logo" />
            </a>
            <div className="hp-sidebar-img">
                <a href="https://study.unimelb.edu.au/study-with-us/undergraduate-courses" className="hp-photo-item" target="_blank">
                    <img src='./Home_Page_img/undergraduate.png' alt="Undergraduate" />
                    <div className="hp-overlay-text">Undergraduate</div>
                </a>
                <a href="https://study.unimelb.edu.au/study-with-us/graduate-courses" className="hp-photo-item" target="_blank">
                    <img src='./Home_Page_img/graduate.png' alt="Graduate" />
                    <div className="hp-overlay-text">Graduate</div>
                </a>
                <a href="https://students.unimelb.edu.au/your-course/manage-your-course/planning-your-course-and-subjects/choosing-your-major" className="photo-item" target="_blank">
                    <img src='./Home_Page_img/clocktower.jpeg' alt="Major" />
                    <div className="hp-overlay-text">Major</div>
                </a>
            </div>
        </aside>
    )
}

export default Home_side
