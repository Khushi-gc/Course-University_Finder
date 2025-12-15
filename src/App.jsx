import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import './App.css';
import logo from './assets/logo.png';
import { COUNTRIES } from './countries';
import { Courses } from './pages/Courses';
import { Universities } from './pages/Universities';

function Header({
  isScrolled,
  isMenuOpen,
  setIsMenuOpen,
  locationSearch,
  setLocationSearch,
  showCountryList,
  setShowCountryList,
  filteredCountries,
  handleCountrySelect,
  locationWrapperRef
}) {
  const location = useLocation();
  const [showPageMenu, setShowPageMenu] = useState(false);
  const pageMenuRef = useRef(null);

  const currentPageTitle = location.pathname === '/universities' ? 'Universities' : 'Courses';

  // Close page menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pageMenuRef.current && !pageMenuRef.current.contains(event.target)) {
        setShowPageMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`app-header ${isScrolled ? 'glass-header' : ''}`}>
      <div className="container header-content">
        <div className="logo-container">
          <img src={logo} alt="GlobCred" className="logo-img" />
        </div>

        {/* Desktop & Tablet Nav */}
        <nav className={`nav-links centered ${isMenuOpen ? 'mobile-hidden' : ''}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            Courses
            <svg className="nav-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </NavLink>
          <NavLink
            to="/universities"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Universities
            <svg className="nav-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </NavLink>
        </nav>

        <div className="header-right">
          {/* Location Input */}
          <div className="location-wrapper-desktop" ref={locationWrapperRef}>
            <div className="location-search-container">
              <svg xmlns="http://www.w3.org/2000/svg" className="location-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>

              <input
                type="text"
                className="location-input"
                placeholder=" "
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onFocus={() => setShowCountryList(true)}
              />
              <label className="location-label">Current Location</label>

              <div className={`country-dropdown ${showCountryList ? 'open' : ''}`}>
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    className="country-item"
                    onClick={() => handleCountrySelect(country.name)}
                  >
                    <div className="country-info">
                      <img
                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                        alt={`${country.name} Flag`}
                        className="country-flag"
                        loading="lazy"
                      />
                      <span className="country-name">{country.name}</span>
                    </div>
                    <span className="country-code">{country.code}</span>
                  </div>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="country-item" style={{ cursor: 'default' }}>
                    <span className="country-name" style={{ color: '#94a3b8' }}>No countries found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Page Selector (New) */}
          <div className="mobile-page-selector" ref={pageMenuRef} onClick={() => setShowPageMenu(!showPageMenu)}>
            <span>{currentPageTitle}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>

            {showPageMenu && (
              <div className="mobile-page-dropdown">
                <NavLink to="/" className={`mobile-page-option ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setShowPageMenu(false)}>
                  Courses
                </NavLink>
                <NavLink to="/universities" className={`mobile-page-option ${location.pathname === '/universities' ? 'active' : ''}`} onClick={() => setShowPageMenu(false)}>
                  Universities
                </NavLink>
              </div>
            )}
          </div>

          {/* Hamburger Menu Icon - Animated */}
          <div
            className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header Location State
  const [locationSearch, setLocationSearch] = useState("");
  const [showCountryList, setShowCountryList] = useState(false);
  const locationWrapperRef = useRef(null);

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(locationSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(event.target)) {
        setShowCountryList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [locationWrapperRef]);

  const handleCountrySelect = (countryName) => {
    setLocationSearch(countryName);
    setShowCountryList(false);
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <Router>
      <div className="min-h-screen">
        <Header
          isScrolled={isScrolled}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          locationSearch={locationSearch}
          setLocationSearch={setLocationSearch}
          showCountryList={showCountryList}
          setShowCountryList={setShowCountryList}
          filteredCountries={filteredCountries}
          handleCountrySelect={handleCountrySelect}
          locationWrapperRef={locationWrapperRef}
        />

        <Routes>
          <Route path="/" element={
            <Courses
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              locationProps={{ locationSearch, setLocationSearch, filteredCountries, handleCountrySelect, showCountryList, setShowCountryList }}
            />
          } />
          <Route path="/universities" element={
            <Universities
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              locationProps={{ locationSearch, setLocationSearch, filteredCountries, handleCountrySelect, showCountryList, setShowCountryList }}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
