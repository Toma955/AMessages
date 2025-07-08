"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import hrv from "../../locales/Hrv.json";
import eng from "../../locales/Eng.json";
import api from "../../services/api";

const NAME_REGEX = /^[a-zA-ZčćđšžČĆĐŠŽ\s]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{6,}$/;
const COMMON_PASSWORDS = ['abc123', 'password123', '123456', 'qwerty'];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export default function RegisterForm({ 
    onBack, 
    language = "en"
}) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        gender: ""
    });

    const [errors, setErrors] = useState({});
    const [hoverText, setHoverText] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [validations, setValidations] = useState({
        firstName: false,
        lastName: false,
        username: false,
        password: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
            notCommon: true
        },
        confirmPassword: false,
        dateOfBirth: false,
        gender: false
    });

    const t = language === "en" ? eng : hrv;

    useEffect(() => {
        // Show validation sidebar when user starts typing
        const hasInput = Object.values(formData).some(value => value !== "");
        setShowValidation(hasInput);
    }, [formData]);

    const validateField = (name, value) => {
        switch (name) {
            case "firstName":
            case "lastName":
                const isValidName = value.length >= 2 && NAME_REGEX.test(value);
                setValidations(prev => ({
                    ...prev,
                    [name]: isValidName
                }));
                return isValidName ? "" : t.nameSpecialChars;
            
            case "username":
                const isValidUsername = value.length >= 3 && USERNAME_REGEX.test(value);
                // TODO: Check if username is taken from backend
                const isTaken = false; // This should be checked against backend
                setValidations(prev => ({
                    ...prev,
                    username: isValidUsername && !isTaken
                }));
                if (!isValidUsername) return t.usernameInvalid;
                if (isTaken) return t.usernameTaken;
                return "";
            
            case "password":
                const validations = {
                    length: value.length >= 6,
                    uppercase: /[A-Z]/.test(value),
                    lowercase: /[a-z]/.test(value),
                    number: /\d/.test(value),
                    special: /[@$!%*?&]/.test(value),
                    notCommon: !COMMON_PASSWORDS.includes(value.toLowerCase())
                };
                setValidations(prev => ({
                    ...prev,
                    password: validations
                }));
                return PASSWORD_REGEX.test(value) && validations.notCommon ? "" : t.passwordRequirements;
            
            case "confirmPassword":
                const matches = value === formData.password;
                setValidations(prev => ({
                    ...prev,
                    confirmPassword: matches
                }));
                return matches ? "" : t.passwordMismatch;
            
            case "dateOfBirth":
                // Handle dd.mm.yyyy format
                const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
                const match = value.match(dateRegex);
                
                if (match) {
                    const [, day, month, year] = match;
                    const date = new Date(year, month - 1, day);
                    // Uklonjena dobna provjera - samo provjerava format
                    setValidations(prev => ({
                        ...prev,
                        dateOfBirth: true
                    }));
                    return "";
                } else {
                    setValidations(prev => ({
                        ...prev,
                        dateOfBirth: false
                    }));
                    return "Please use dd.mm.yyyy format";
                }
            
            case "gender":
                const isValidGender = ["M", "F"].includes(value);
                setValidations(prev => ({
                    ...prev,
                    gender: isValidGender
                }));
                return isValidGender ? "" : t.selectGender;
            
            default:
                return "";
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const isFormValid = () => {
        return (
            validations.firstName &&
            validations.lastName &&
            validations.username &&
            Object.values(validations.password).every(Boolean) &&
            validations.confirmPassword &&
            validations.dateOfBirth &&
            validations.gender &&
            !Object.values(errors).some(Boolean)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid()) {
            return;
        }

        try {
            const response = await api.post('/api/users', {
                username: formData.username,
                password: formData.password,
                name: formData.firstName,
                surname: formData.lastName,
                gender: formData.gender === "M" ? "male" : "female",
                date_of_birth: formData.dateOfBirth,
                theme: "dark",
                language: language
            });

            if (response.success) {
                // Redirect back to login page after successful registration
                onBack();
            }
        } catch (error) {
            // Handle specific error cases
            const errorCode = error.message.split(':')[0];
            switch(errorCode) {
                case 'USERNAME_EXISTS':
                    setErrors(prev => ({
                        ...prev,
                        username: t.usernameTaken
                    }));
                    break;
                case 'MISSING_REQUIRED_FIELD':
                    // This shouldn't happen due to frontend validation
                    break;
                default:
                    // Show general error in the form
                    setErrors(prev => ({
                        ...prev,
                        general: t.registrationError || "Registration failed. Please try again."
                    }));
            }
        }
    };

    const handleGenderSelect = (gender) => {
        setFormData(prev => ({ ...prev, gender }));
        const error = validateField('gender', gender);
        setErrors(prev => ({ ...prev, gender: error }));
    };

    const handleDateSelect = (date) => {
        handleChange({
            target: {
                name: 'dateOfBirth',
                value: date
            }
        });
        setShowDatePicker(false);
    };

    const handleCalendarClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (showDatePicker || showYearPicker || showMonthPicker) {
            // If any picker is open, close everything
            setShowDatePicker(false);
            setShowMonthPicker(false);
            setShowYearPicker(false);
        } else {
            // If nothing is open, start with ONLY year picker
            setShowDatePicker(false); // Don't show calendar background
            setShowYearPicker(true);
            setShowMonthPicker(false);
        }
    };

    const handleDateInputClick = (e) => {
        // Do nothing - let user type in the input
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.custom-date-picker') && 
                !e.target.closest('.calendar-icon') && 
                !e.target.closest('.date-input')) {
                setShowDatePicker(false);
                setShowMonthPicker(false);
                setShowYearPicker(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // CustomDatePicker component inside RegisterForm to access props
    function CustomDatePicker({ selectedDate, onDateSelect, visible, showYearPicker, showMonthPicker, setShowYearPicker, setShowMonthPicker, setShowDatePicker, selectedYear, selectedMonth, setSelectedYear, setSelectedMonth }) {
        const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // Počinje od 2025
        const [displayedMonth, setDisplayedMonth] = useState(new Date(2025, 0, 1)); // Počinje od 2025

        // Update displayedMonth when selectedYear and selectedMonth change
        useEffect(() => {
            if (selectedYear !== null && selectedMonth !== null) {
                const newDate = new Date(selectedYear, selectedMonth, 1);
                setDisplayedMonth(newDate);
            }
        }, [selectedYear, selectedMonth]);

        const getDaysInMonth = (date) => {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        };

        const getFirstDayOfMonth = (date) => {
            return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        };

        const generateCalendarDays = () => {
            const daysInMonth = getDaysInMonth(displayedMonth);
            const firstDay = getFirstDayOfMonth(displayedMonth);
            console.log('Days in month:', daysInMonth, 'First day of week:', firstDay);
            console.log('displayedMonth is valid:', !isNaN(displayedMonth.getTime()));
            
            const days = [];

            // Previous month days (only to fill the first week)
            const prevMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
            const daysInPrevMonth = getDaysInMonth(prevMonth);
            console.log('Previous month days to add:', Math.max(0, firstDay - 1));
            for (let i = firstDay - 1; i >= 0; i--) {
                days.push({
                    day: daysInPrevMonth - i,
                    month: 'prev',
                    date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i)
                });
            }

            // Current month days
            console.log('Adding current month days:', daysInMonth);
            for (let i = 1; i <= daysInMonth; i++) {
                days.push({
                    day: i,
                    month: 'current',
                    date: new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), i)
                });
            }

            // Next month days (only to complete the last week)
            const totalDays = days.length;
            const weeksNeeded = Math.ceil(totalDays / 7);
            const totalCellsNeeded = weeksNeeded * 7;
            const remainingDays = totalCellsNeeded - totalDays;
            console.log('Total days so far:', totalDays, 'Weeks needed:', weeksNeeded, 'Remaining days to add:', remainingDays);
            
            for (let i = 1; i <= remainingDays; i++) {
                days.push({
                    day: i,
                    month: 'next',
                    date: new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, i)
                });
            }

            console.log('Generated days:', days.length, 'for month with', daysInMonth, 'days');
            return days;
        };

        const isToday = (date) => {
            return false; // Don't highlight today's date
        };

        const isSelected = (date) => {
            return selectedDate && date.toDateString() === new Date(selectedDate).toDateString();
        };

        const isFutureDate = (date) => {
            return date > new Date();
        };

        const isUnder13 = (date) => {
            return false; // Uklonjena dobna granica
        };

        const handleDateClick = (date) => {
            console.log('Date clicked:', date);
            if (!isFutureDate(date) && !isUnder13(date)) {
                // Only update the day part, keep existing month and year from selected values
                const day = date.getDate().toString().padStart(2, '0');
                const month = (selectedMonth !== null ? selectedMonth + 1 : displayedMonth.getMonth() + 1).toString().padStart(2, '0');
                const year = (selectedYear || displayedMonth.getFullYear()).toString();
                const formattedDate = `${day}.${month}.${year}`;
                
                console.log('Final formatted date:', formattedDate);
                
                onDateSelect(formattedDate);
                setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
                const error = validateField('dateOfBirth', formattedDate);
                setErrors(prev => ({ ...prev, dateOfBirth: error }));
                // Close everything
                setShowDatePicker(false);
                setShowMonthPicker(false);
                setShowYearPicker(false);
            }
        };

        const handleYearSelect = (year) => {
            console.log('Year selected:', year);
            setSelectedYear(year);
            
            // Only update the year part, keep existing day and month if any
            const currentValue = formData.dateOfBirth || "";
            const parts = currentValue.split('.');
            const day = parts[0] || "";
            const month = parts[1] || "";
            const formattedDate = `${day}.${month}.${year}`;
            
            console.log('Formatted date after year:', formattedDate);
            
            // Update the form data
            setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
            
            // Show month picker next
            setShowYearPicker(false);
            setShowMonthPicker(true);
            setShowDatePicker(false);
        };

        const handleMonthSelect = (monthIndex) => {
            console.log('Month selected:', monthIndex, MONTHS[monthIndex]);
            console.log('Current selectedYear:', selectedYear);
            setSelectedMonth(monthIndex);
            
            // Only update the month part, keep existing day and year
            const month = (monthIndex + 1).toString().padStart(2, '0');
            const currentValue = formData.dateOfBirth || "";
            const parts = currentValue.split('.');
            const day = parts[0] || "";
            const year = parts[2] || selectedYear || "";
            const formattedDate = `${day}.${month}.${year}`;
            
            console.log('Formatted date after month:', formattedDate);
            
            // Update the form data
            setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
            
            // Show calendar with days - use selectedYear and selectedMonth
            const yearToUse = selectedYear || parseInt(year) || 2025; // Default 2025
            console.log('Using year:', yearToUse, 'and month:', monthIndex, 'for calendar');
            
            // Set the selected year and month
            setSelectedYear(yearToUse);
            setSelectedMonth(monthIndex);
            
            // The displayedMonth will be updated by the useEffect
            setShowMonthPicker(false);
            setShowDatePicker(true);
            console.log('After setting - showDatePicker:', true, 'selectedYear:', yearToUse, 'selectedMonth:', monthIndex);
        };

        const generateYearOptions = () => {
            const currentYear = 2025; // Počinje od 2025
            const years = [];
            for (let i = currentYear - 100; i <= currentYear; i++) { // Uklonjena dobna granica
                years.push(i);
            }
            return years.reverse();
        };

        return (
            <div 
                className={`custom-date-picker ${(showDatePicker || showYearPicker || showMonthPicker) ? 'visible' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Step 1: Year Picker */}
                {showYearPicker && (
                    <div className="year-picker">
                        <div className="picker-header">
                            <h3>Select Year</h3>
                        </div>
                        <div className="picker-grid">
                            {generateYearOptions().map((year) => (
                                <button
                                    key={year}
                                    className={`picker-item ${year === selectedYear ? 'selected' : ''}`}
                                    onClick={() => {
                                        console.log('Year button clicked:', year);
                                        handleYearSelect(year);
                                    }}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Month Picker */}
                {showMonthPicker && (
                    <div className="month-picker">
                        <div className="picker-header">
                            <button 
                                className="picker-back-button"
                                onClick={() => {
                                    setShowMonthPicker(false);
                                    setShowYearPicker(true);
                                    setShowDatePicker(false);
                                    // Reset the date when going back
                                    setFormData(prev => ({ ...prev, dateOfBirth: "" }));
                                }}
                            >
                                <Image src="/icons/Left.png" alt="Back" width={16} height={16} unoptimized />
                                Back to Year
                            </button>
                            <h3>Select Month</h3>
                        </div>
                        <div className="picker-grid">
                            {MONTHS.map((month, index) => (
                                <button
                                    key={month}
                                    className={`picker-item ${index === selectedMonth ? 'selected' : ''}`}
                                    onClick={() => {
                                        console.log('Month button clicked:', index, month);
                                        handleMonthSelect(index);
                                    }}
                                >
                                    {month.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Calendar with Days */}
                {showDatePicker && (
                    <>
                        <div className="calendar-header">
                            <div className="month-year">
                                <button 
                                    className="picker-back-button"
                                    onClick={() => {
                                        setShowDatePicker(false);
                                        setShowMonthPicker(true);
                                        setShowYearPicker(false);
                                    }}
                                >
                                    <Image src="/icons/Left.png" alt="Back" width={16} height={16} unoptimized />
                                    Back to Month
                                </button>
                                <span className="month-year-text">
                                    {selectedMonth !== null ? MONTHS[selectedMonth] : MONTHS[displayedMonth.getMonth()]} {selectedYear || displayedMonth.getFullYear()}
                                </span>
                            </div>
                            <div className="calendar-nav">
                                <button className="calendar-close-button" onClick={() => {
                                    setShowDatePicker(false);
                                    setShowMonthPicker(false);
                                    setShowYearPicker(false);
                                }}>
                                    <Image src="/icons/Close.png" alt="Close" width={20} height={20} unoptimized />
                                </button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                            {(() => {
                                const days = generateCalendarDays();
                                return days.map((day, index) => {
                                    const isDisabled = isFutureDate(day.date) || isUnder13(day.date);
                                    const classes = [
                                        'date-cell',
                                        day.month !== 'current' ? 'other-month' : '',
                                        isToday(day.date) ? 'today' : '',
                                        isSelected(day.date) ? 'selected' : '',
                                        isDisabled ? 'disabled' : ''
                                    ].filter(Boolean).join(' ');

                                    return (
                                        <div
                                            key={`${day.month}-${day.day}-${index}`}
                                            className={classes}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Cell clicked:', day.date, 'Disabled:', isDisabled);
                                                if (!isDisabled) {
                                                    handleDateClick(day.date);
                                                }
                                            }}
                                        >
                                            {day.day}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="login-container">
                <div className="login-form-wrapper">
                    <div className="login-box register">
                        <div className="form-header">
                            <button
                                className="back-button"
                                onClick={onBack}
                                onMouseEnter={() => setHoverText(t.backToLogin)}
                                onMouseLeave={() => setHoverText("")}
                            >
                                <Image
                                    src="/icons/Back.png"
                                    alt="Back"
                                    width={24}
                                    height={24}
                                />
                            </button>
                            <h1 className="title">{t.registerTitle}</h1>
                        </div>

                        {hoverText && <div className="hover-message">{hoverText}</div>}

                        <form onSubmit={handleSubmit} className="register-form">
                            {errors.general && (
                                <div className="error-message text-center">{errors.general}</div>
                            )}
                            
                            <div className="name-row">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder={t.firstNamePlaceholder}
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={errors.firstName ? "error" : ""}
                                    />
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                </div>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder={t.lastNamePlaceholder}
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={errors.lastName ? "error" : ""}
                                    />
                                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="input-group">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder={t.usernamePlaceholder}
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={errors.username ? "error" : ""}
                                />
                                {errors.username && <span className="error-message">{errors.username}</span>}
                            </div>

                            <div className="input-group">
                                <div className="password-input">
                                    <input
                                        type={passwordVisible ? "text" : "password"}
                                        name="password"
                                        placeholder={t.passwordPlaceholder}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={errors.password ? "error" : ""}
                                    />
                                    <button
                                        type="button"
                                        className={`icon-circle small ${passwordVisible ? "red" : "green"}`}
                                        onClick={() => setPasswordVisible(prev => !prev)}
                                        onMouseEnter={() => setHoverText(passwordVisible ? t.hideHover : t.showHover)}
                                        onMouseLeave={() => setHoverText("")}
                                    >
                                        <Image
                                            src="/icons/Magnifying_glass.png"
                                            alt="Toggle"
                                            width={16}
                                            height={16}
                                            unoptimized
                                        />
                                    </button>
                                </div>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>

                            <div className="input-group">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder={t.confirmPasswordPlaceholder}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={errors.confirmPassword ? "error" : ""}
                                />
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>

                            <div className="input-group">
                                <div className="date-input-container">
                                    <input
                                        type="text"
                                        name="dateOfBirth"
                                        placeholder="dd.mm.yyyy"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className={`date-input ${errors.dateOfBirth ? "error" : ""}`}
                                    />
                                    <div 
                                        className="calendar-icon"
                                        onClick={handleCalendarClick}
                                    >
                                        <Image
                                            src="/icons/Calendar.png"
                                            alt="Calendar"
                                            width={24}
                                            height={24}
                                            unoptimized
                                        />
                                    </div>
                                </div>
                                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                            </div>

                            <div className="gender-selection">
                                <button
                                    type="button"
                                    className={`gender-button male ${formData.gender === "M" ? "selected" : ""}`}
                                    onClick={() => handleGenderSelect("M")}
                                >
                                    <Image
                                        src="/icons/Male.png"
                                        alt="Male"
                                        width={24}
                                        height={24}
                                        unoptimized
                                    />
                                    {t.male}
                                </button>
                                <button
                                    type="button"
                                    className={`gender-button female ${formData.gender === "F" ? "selected" : ""}`}
                                    onClick={() => handleGenderSelect("F")}
                                >
                                    <Image
                                        src="/icons/Female.png"
                                        alt="Female"
                                        width={24}
                                        height={24}
                                        unoptimized
                                    />
                                    {t.female}
                                </button>
                            </div>
                            {errors.gender && <span className="error-message text-center">{errors.gender}</span>}

                            <div className="buttons-container">
                                <button 
                                    type="submit" 
                                    className="register-btn"
                                    disabled={!isFormValid()}
                                >
                                    {t.registerButton || "Register"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <CustomDatePicker
                        selectedDate={formData.dateOfBirth}
                        onDateSelect={handleDateSelect}
                        visible={showDatePicker}
                        showYearPicker={showYearPicker}
                        showMonthPicker={showMonthPicker}
                        setShowYearPicker={setShowYearPicker}
                        setShowMonthPicker={setShowMonthPicker}
                        setShowDatePicker={setShowDatePicker}
                        selectedYear={selectedYear}
                        selectedMonth={selectedMonth}
                        setSelectedYear={setSelectedYear}
                        setSelectedMonth={setSelectedMonth}
                    />

                    <div className={`validation-sidebar ${showValidation ? 'visible strong' : ''}`}>
                        <div className={`validation-item ${validations.firstName ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.firstName ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.firstNameValidation}
                        </div>
                        <div className={`validation-item ${validations.lastName ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.lastName ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.lastNameValidation}
                        </div>
                        <div className={`validation-item ${validations.username ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.username ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.usernameValidation}
                        </div>
                        <div className={`validation-item ${validations.password.length ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.password.length ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.passwordLengthValidation}
                        </div>
                        <div className={`validation-item ${validations.password.uppercase ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.password.uppercase ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.passwordUppercaseValidation}
                        </div>
                        <div className={`validation-item ${validations.password.lowercase ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.password.lowercase ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.passwordLowercaseValidation}
                        </div>
                        <div className={`validation-item ${validations.password.number ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.password.number ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.passwordNumberValidation}
                        </div>
                        <div className={`validation-item ${validations.password.special ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.password.special ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.passwordSpecialValidation}
                        </div>
                        <div className={`validation-item ${validations.password.notCommon ? 'valid' : 'invalid'}`}>
                            <div className="validation-icon">
                                <Image
                                    src={validations.password.notCommon ? "/icons/Yes.png" : "/icons/No.png"}
                                    alt="Validation"
                                    width={16}
                                    height={16}
                                    unoptimized
                                />
                            </div>
                            {t.passwordCommonValidation}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}