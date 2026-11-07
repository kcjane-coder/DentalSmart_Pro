import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <>
      {/* NAVIGATION BAR */}
      <header className="navbar">

        {/* LOGO */}
        <div className="logo-container">
          <img
            src="https://i.pinimg.com/736x/4f/0c/05/4f0c05eb95fdfd934b44d297e988fc73.jpg"
            alt="DentalSmart Tooth Logo"
            className="logo"
          />

          <span className="brand-name">DentalSmart</span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="nav-links">
  <Link to="/" className="nav-item-link">
    Home
  </Link>

        <a href="#about" className="nav-item-link">
          About
        </a>

        <a href="#services" className="nav-item-link">
          Services
        </a>

        <Link to="/Login" className="nav-btn">
          Login
        </Link>

        <Link to="/Register" className="nav-btn">
          Register
        </Link>
      </nav>

        
      </header>

      {/* HOME SECTION */}
      <section className="hero" id="home">

        <div className="logo-container">
          <img
            src="https://i.pinimg.com/736x/4f/0c/05/4f0c05eb95fdfd934b44d297e988fc73.jpg"
            alt="DentalSmart Tooth Logo"
            className="logo"
          />
        </div>

        <h1>DentalSmart</h1>

        <p>
          Manage your dental appointments with ease.
          Book your appointment and stay connected with your dental
          care team.
        </p>

        <Link to="/Register" className="hero-button">
          Get Started
        </Link>

        {/* DENTAL PICTURE GALLERY */}
        <div className="gallery">

          <img
            src="https://i.pinimg.com/736x/f7/17/16/f71716cd64f269b22f0ad5a346de4245.jpg"
            alt="Dentist consulting a patient"
          />

          <img
            src="https://i.pinimg.com/736x/f6/a0/b8/f6a0b8b7d47275a1c27cc370de0e596a.jpg"
            alt="Dentist examining a child"
          />

          <img
            src="https://i.pinimg.com/736x/d0/65/e2/d065e2427cd761204ccf69625deb99f9.jpg"
            alt="Dentist performing a dental examination"
          />

        </div>

      </section>

      {/* ABOUT SECTION */}
      <section className="landing-section" id="about">

        <h2>About DentalSmart</h2>

        <p>
          DentalSmart is a dental appointment management system
          designed to make dental care more convenient and accessible.
          Patients can connect with dental professionals,
          manage appointments, and receive important updates.
        </p>

      </section>

      {/* SERVICES SECTION */}
      <section className="landing-section" id="services">

        <h2>Our Services</h2>

        <div className="services-grid">

          <div className="service-card">
            <i className="fa-solid fa-calendar-check"></i>
            <h3>Appointment Booking</h3>
            <p>Schedule dental appointments conveniently.</p>
          </div>

          <div className="service-card">
            <i className="fa-solid fa-user-doctor"></i>
            <h3>Dentist Information</h3>
            <p>Connect with dental professionals.</p>
          </div>

          <div className="service-card">
            <i className="fa-solid fa-bell"></i>
            <h3>Notifications</h3>
            <p>Receive appointment updates and reminders.</p>
          </div>

          <div className="service-card">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <h3>AI Assistance</h3>
            <p>Get assistance with dental appointment inquiries.</p>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© 2026 DentalSmart. All rights reserved.</p>
      </footer>

    </>
  );
}

export default LandingPage;