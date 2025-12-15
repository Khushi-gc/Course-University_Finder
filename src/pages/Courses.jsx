import { useState, useRef, useEffect } from 'react';
import { COURSES_DATA } from '../data';
import { COUNTRIES } from '../countries';

export function Courses({ isMenuOpen, setIsMenuOpen, locationProps }) {
    const {
        locationSearch, setLocationSearch,
        filteredCountries
    } = locationProps || {};

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("Popularity");
    const [showSort, setShowSort] = useState(false);
    const [scholarship, setScholarship] = useState(null);
    const [feeRange, setFeeRange] = useState([0, 100000]);

    // Destination Filter State
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [destSearch, setDestSearch] = useState("");
    const destRef = useRef(null);
    const sortRef = useRef(null);
    const scrollRef = useRef(null);

    // Mobile Location State
    const [showMobileLocationList, setShowMobileLocationList] = useState(false);
    const mobileLocationRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 100;
            if (direction === 'left') {
                current.scrollLeft -= scrollAmount;
            } else {
                current.scrollLeft += scrollAmount;
            }
        }
    };

    const removeDestination = (e, country) => {
        e.stopPropagation();
        setSelectedDestinations(selectedDestinations.filter(c => c.code !== country.code));
    };

    // Constants for slider
    const MIN_FEE = 0;
    const MAX_FEE = 100000;

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setShowSort(false);
            }
            if (destRef.current && !destRef.current.contains(event.target)) {
                setShowDestDropdown(false);
            }
            if (mobileLocationRef.current && !mobileLocationRef.current.contains(event.target)) {
                setShowMobileLocationList(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [sortRef, destRef, mobileLocationRef]);

    const handleMobileLocationSelect = (name) => {
        setLocationSearch(name);
        setShowMobileLocationList(false);
    };

    const handleMinFeeChange = (e) => {
        const value = Math.min(Number(e.target.value), feeRange[1] - 1000);
        setFeeRange([value, feeRange[1]]);
    };

    const handleMaxFeeChange = (e) => {
        const value = Math.max(Number(e.target.value), feeRange[0] + 1000);
        setFeeRange([feeRange[0], value]);
    };

    const toggleDestination = (country) => {
        if (selectedDestinations.find(c => c.code === country.code)) {
            setSelectedDestinations(selectedDestinations.filter(c => c.code !== country.code));
        } else {
            setSelectedDestinations([...selectedDestinations, country]);
        }
    };

    const filteredDestinations = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(destSearch.toLowerCase())
    );

    const filteredCourses = COURSES_DATA.filter(course =>
        (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.university.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (scholarship === null || (scholarship === 'yes' ? true : false)) &&
        ((course.numericFee || 0) >= feeRange[0] && (course.numericFee || 0) <= feeRange[1])
        // Logic for destination filtering would go here (checking if course.location includes any selected country name)
    );

    const sortedCourses = [...filteredCourses].sort((a, b) => {
        switch (sortOption) {
            case "Popularity":
                return (b.popularity || 0) - (a.popularity || 0);
            case "Rankings":
                return (a.ranking || 999) - (b.ranking || 999);
            case "Tuition Fee (Low to High)":
                return (a.numericFee || 0) - (b.numericFee || 0);
            case "Tuition Fee (High to Low)":
                return (b.numericFee || 0) - (a.numericFee || 0);
            default:
                return 0;
        }
    });

    const handleSortSelect = (option) => {
        setSortOption(option);
        setShowSort(false);
    };

    const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

    // Calculate percentage positions for slider track
    const minPercent = ((feeRange[0] - MIN_FEE) / (MAX_FEE - MIN_FEE)) * 100;
    const maxPercent = ((feeRange[1] - MIN_FEE) / (MAX_FEE - MIN_FEE)) * 100;

    return (
        <div className="container main-layout animate-fade-in">
            {/* Overlay for mobile when menu is open */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            <aside className={`filters-sidebar ${isMenuOpen ? 'mobile-open' : ''}`}>
                {/* Mobile Location Input */}
                <div className="sidebar-location-wrapper lg:hidden" ref={mobileLocationRef}>
                    <div className="location-search-container">
                        <svg xmlns="http://www.w3.org/2000/svg" className="location-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>

                        <input
                            type="text"
                            className="location-input"
                            value={locationSearch}
                            onChange={(e) => setLocationSearch(e.target.value)}
                            onFocus={() => setShowMobileLocationList(true)}
                            placeholder=" "
                        />
                        <label className="location-label">Current Location</label>

                        <div className={`country-dropdown ${showMobileLocationList ? 'open' : ''}`}>
                            {filteredCountries && filteredCountries.map((country) => (
                                <div
                                    key={country.code}
                                    className="country-item"
                                    onClick={() => handleMobileLocationSelect(country.name)}
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
                            {filteredCountries && filteredCountries.length === 0 && (
                                <div className="country-item" style={{ cursor: 'default' }}>
                                    <span className="country-name" style={{ color: '#94a3b8' }}>No countries found</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Nav Header (Close Button + Logo optional) */}


                {/* Study Destination Filter */}
                <div className="filter-section" ref={destRef}>
                    <h3 className="filter-title">Study Destination</h3>
                    {/* ... content ... */}


                    <div className="destination-filter-container">
                        <div className="destination-input-wrapper" onClick={() => setShowDestDropdown(!showDestDropdown)}>
                            <div className="destination-content">
                                {selectedDestinations.length === 0 ? (
                                    <span className="placeholder-text">Select Country...</span>
                                ) : (
                                    <div className="scroll-container-wrapper">
                                        {selectedDestinations.length > 2 && (
                                            <div className="scroll-btn left" onClick={(e) => { e.stopPropagation(); scroll('left'); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </div>
                                        )}

                                        <div className="selected-display" ref={scrollRef}>
                                            {selectedDestinations.map((country) => (
                                                <div key={country.code} className="selected-chippy">
                                                    <img src={getFlagUrl(country.code)} alt="" className="dest-flag" />
                                                    <span style={{ fontSize: '0.85rem' }}>{country.name}</span>
                                                    <div className="chip-remove" onClick={(e) => removeDestination(e, country)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {selectedDestinations.length > 2 && (
                                            <div className="scroll-btn right" onClick={(e) => { e.stopPropagation(); scroll('right'); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="input-actions">
                                {selectedDestinations.length > 0 && (
                                    <div
                                        className="clear-btn"
                                        onClick={(e) => { e.stopPropagation(); setSelectedDestinations([]); }}
                                        title="Clear all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {showDestDropdown && (
                            <div className="destination-dropdown" onClick={(e) => e.stopPropagation()}>
                                <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="dest-search-input"
                                        placeholder="Search countries"
                                        value={destSearch}
                                        onChange={(e) => setDestSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="dest-list">
                                    {filteredDestinations.map(country => {
                                        const isSelected = selectedDestinations.some(c => c.code === country.code);
                                        return (
                                            <div
                                                key={country.code}
                                                className={`dest-option ${isSelected ? 'selected' : ''}`}
                                                onClick={() => toggleDestination(country)}
                                            >
                                                <div className="dest-info">
                                                    <img src={getFlagUrl(country.code)} alt="" className="dest-flag" />
                                                    <span className="dest-name">{country.name}</span>
                                                </div>
                                                <div className="checkbox-circle">
                                                    {isSelected && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="filter-section">
                    <h3 className="filter-title">Study Level</h3>
                    <div className="checkbox-group">
                        <label className="checkbox-label"><input type="checkbox" defaultChecked /> Undergraduate</label>
                        <label className="checkbox-label"><input type="checkbox" defaultChecked /> Postgraduate</label>
                        <label className="checkbox-label"><input type="checkbox" /> PhD</label>
                        <label className="checkbox-label"><input type="checkbox" /> Diploma</label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3 className="filter-title">Mode of Study</h3>
                    <div className="checkbox-group">
                        <label className="checkbox-label"><input type="checkbox" defaultChecked /> Full time</label>
                        <label className="checkbox-label"><input type="checkbox" /> Part time</label>
                        <label className="checkbox-label"><input type="checkbox" /> Online / Distance</label>
                    </div>
                </div>

                <div className="filter-section">
                    <h3 className="filter-title">Tuition Fee ($)</h3>
                    <div className="fee-filter-container">
                        <div className="fee-inputs">
                            <div className="fee-input-group">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    value={feeRange[0]}
                                    onChange={handleMinFeeChange}
                                    className="fee-number-input"
                                    min={MIN_FEE}
                                    max={feeRange[1]}
                                />
                            </div>
                            <div className="fee-input-group">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    value={feeRange[1]}
                                    onChange={handleMaxFeeChange}
                                    className="fee-number-input"
                                    min={feeRange[0]}
                                    max={MAX_FEE}
                                />
                            </div>
                        </div>

                        <div className="slider-container">
                            <div className="slider-track"></div>
                            <div
                                className="slider-range"
                                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                            ></div>
                            <input
                                type="range"
                                min={MIN_FEE}
                                max={MAX_FEE}
                                value={feeRange[0]}
                                onChange={handleMinFeeChange}
                                className="range-input"
                            />
                            <input
                                type="range"
                                min={MIN_FEE}
                                max={MAX_FEE}
                                value={feeRange[1]}
                                onChange={handleMaxFeeChange}
                                className="range-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="filter-section">
                    <h3 className="filter-title">Scholarship Availability</h3>
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="radio"
                                name="scholarship"
                                checked={scholarship === 'yes'}
                                onChange={() => setScholarship('yes')}
                            /> Yes
                        </label>
                        <label className="checkbox-label">
                            <input
                                type="radio"
                                name="scholarship"
                                checked={scholarship === 'no'}
                                onChange={() => setScholarship('no')}
                            /> No
                        </label>
                        {scholarship && (
                            <button
                                onClick={() => setScholarship(null)}
                                className="text-xs text-[#052659] hover:underline mt-1 text-left"
                            >
                                Clear selection
                            </button>
                        )}
                    </div>
                </div>
            </aside >

            <section className="results-section">
                <div className="search-section">
                    <h1 className="text-3xl font-bold mb-6 text-[#052659]">Find your perfect course</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for courses, universities, or keywords..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary">Search</button>
                    </div>
                </div>

                <div className="results-header flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-700">Recommended Courses <span className="text-gray-400 font-normal">({sortedCourses.length})</span></h2>

                    <div className="sort-container text-sm text-gray-500" ref={sortRef}>
                        <div className="sort-label">
                            Sort by: <span className="font-medium text-[#052659]">{sortOption}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => setShowSort(!showSort)}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <div className={`sort-dropdown ${showSort ? 'open' : ''}`}>
                            {["Popularity", "Rankings", "Tuition Fee (Low to High)", "Tuition Fee (High to Low)"].map(option => (
                                <div
                                    key={option}
                                    className={`sort-option ${sortOption === option ? 'selected' : ''}`}
                                    onClick={() => handleSortSelect(option)}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="course-grid">
                    {sortedCourses.map(course => (
                        <div key={course.id} className="card course-card">
                            <div className="course-header">
                                <div className="uni-logo" style={{ color: course.logoColor, background: `${course.logoColor}15` }}>
                                    {course.university[0]}
                                </div>
                                <div className="course-info">
                                    <div className="course-badges">
                                        <span className={`badge ${course.level === 'Postgraduate' ? 'badge-purple' : 'badge-blue'}`}>{course.level}</span>
                                        <span className="badge badge-green">{course.mode}</span>
                                    </div>
                                    <h3 className="course-title">{course.title}</h3>
                                    <div className="uni-name">{course.university}</div>
                                </div>
                            </div>

                            <div className="course-details-grid" style={{ padding: '0 1.5rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                                <div className="detail-item">
                                    <span className="font-medium text-gray-900">Location: </span>
                                    {course.location}
                                </div>
                                <div className="detail-item">
                                    <span className="font-medium text-gray-900">Duration: </span>
                                    {course.duration}
                                </div>
                                <div className="detail-item">
                                    <span className="font-medium text-gray-900">Intake: </span>
                                    {course.intake}
                                </div>
                                <div className="detail-item">
                                    <span className="font-medium text-gray-900">Fees: </span>
                                    {course.fees}
                                </div>
                            </div>

                            <div className="course-actions">
                                <button className="btn btn-primary btn-full">View Details</button>
                                <button className="btn btn-outline">Save</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div >
    );
}
