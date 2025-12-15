import { useState, useRef, useEffect } from 'react';
import { UNIVERSITIES_DATA } from '../data';
import { COUNTRIES } from '../countries';

export function Universities({ isMenuOpen, setIsMenuOpen, locationProps }) {
    const {
        locationSearch, setLocationSearch,
        filteredCountries
    } = locationProps || {};

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("Popularity");
    const [showSort, setShowSort] = useState(false);

    // Filter State
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [destSearch, setDestSearch] = useState("");

    const sortRef = useRef(null);
    const destRef = useRef(null);
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

    const toggleDestination = (country) => {
        if (selectedDestinations.find(c => c.code === country.code)) {
            setSelectedDestinations(selectedDestinations.filter(c => c.code !== country.code));
        } else {
            setSelectedDestinations([...selectedDestinations, country]);
        }
    };

    const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

    const filteredDestinations = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(destSearch.toLowerCase())
    );

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

    const filteredUnis = UNIVERSITIES_DATA.filter(uni =>
        (uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            uni.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedDestinations.length === 0 || selectedDestinations.some(d => uni.location.includes(d.name)))
    );

    const sortedUnis = [...filteredUnis].sort((a, b) => {
        switch (sortOption) {
            case "Popularity":
                return (b.popularity || 0) - (a.popularity || 0);
            case "Ranking":
                return (a.ranking || 999) - (b.ranking || 999);
            case "University Name (A-Z)":
                return a.name.localeCompare(b.name);
            case "University Name (Z-A)":
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });

    const handleSortSelect = (option) => {
        setSortOption(option);
        setShowSort(false);
    };

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

                {/* Study Destination Filter */}
                <div className="filter-section" ref={destRef}>
                    <h3 className="filter-title">Study Destination</h3>
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

                {/* Study Level */}
                <div className="filter-section">
                    <h3 className="filter-title">Study Level</h3>
                    <div className="checkbox-group">
                        <label className="checkbox-label"><input type="checkbox" defaultChecked /> Undergraduate</label>
                        <label className="checkbox-label"><input type="checkbox" defaultChecked /> Postgraduate</label>
                        <label className="checkbox-label"><input type="checkbox" /> PhD</label>
                        <label className="checkbox-label"><input type="checkbox" /> Diploma</label>
                    </div>
                </div>

                {/* Mode of Study */}
                <div className="filter-section">
                    <h3 className="filter-title">Mode of Study</h3>
                    <div className="checkbox-group">
                        <label className="checkbox-label"><input type="checkbox" defaultChecked /> Full time</label>
                        <label className="checkbox-label"><input type="checkbox" /> Part time</label>
                        <label className="checkbox-label"><input type="checkbox" /> Online / Distance</label>
                    </div>
                </div>

                {/* Ranking (Kept as it is unique to Universities) */}
                <div className="filter-section">
                    <h3 className="filter-title">Ranking</h3>
                    <div className="checkbox-group">
                        <label className="checkbox-label"><input type="checkbox" /> Top 10</label>
                        <label className="checkbox-label"><input type="checkbox" /> Top 50</label>
                        <label className="checkbox-label"><input type="checkbox" /> Top 100</label>
                    </div>
                </div>
            </aside>

            <section className="results-section">
                <div className="search-section">
                    <h1 className="text-3xl font-bold mb-6 text-[#052659]">Find University</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for universities by name or location..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary">Search</button>
                    </div>
                </div>

                <div className="results-header flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-700">All Universities <span className="text-gray-400 font-normal">({sortedUnis.length})</span></h2>

                    <div className="sort-container text-sm text-gray-500" ref={sortRef}>
                        <div className="sort-label" onClick={() => setShowSort(!showSort)}>
                            Sort by: <span className="font-medium text-[#052659]">{sortOption}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <div className={`sort-dropdown ${showSort ? 'open' : ''}`}>
                            {["Popularity", "Ranking", "University Name (A-Z)", "University Name (Z-A)"].map(option => (
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
                    {sortedUnis.map(uni => (
                        <div key={uni.id} className="card course-card uni-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                            <div className="course-header" style={{ flexDirection: 'column', alignItems: 'center', width: '100%', borderBottom: 'none' }}>
                                <div className="uni-logo" style={{
                                    color: uni.logoColor,
                                    background: `${uni.logoColor}15`,
                                    width: '80px',
                                    height: '80px',
                                    fontSize: '2rem',
                                    marginBottom: '1rem'
                                }}>
                                    {uni.name[0]}
                                </div>

                                <h3 className="course-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{uni.name}</h3>

                                <div className="uni-location" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#64748b',
                                    fontSize: '0.95rem'
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {uni.location}
                                </div>
                            </div>

                            <div className="course-actions" style={{ width: '100%', marginTop: 'auto' }}>
                                <button className="btn btn-primary btn-full">View Profile</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
