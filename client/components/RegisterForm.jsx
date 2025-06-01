"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import hrv from "../locales/Hrv.json";
import eng from "../locales/Eng.json";

const NAME_REGEX = /^[a-zA-ZčćđšžČĆĐŠŽ\s]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
const COMMON_PASSWORDS = ['abc123', 'password123', '123456', 'qwerty'];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function CustomDatePicker({ selectedDate, onDateSelect, visible, language }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [displayedMonth, setDisplayedMonth] = useState(new Date());

    const t = language === "en" ? eng : hrv;

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(displayedMonth);
        const firstDay = getFirstDayOfMonth(displayedMonth);
        const days = [];

        // Previous month days
        const prevMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
        const daysInPrevMonth = getDaysInMonth(prevMonth);
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: daysInPrevMonth - i,
                month: 'prev',
                date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i)
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                month: 'current',
                date: new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), i)
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                month: 'next',
                date: new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, i)
            });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1));
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        return selectedDate && date.toDateString() === new Date(selectedDate).toDateString();
    };

    const isFutureDate = (date) => {
        return date > new Date();
    };

    const isUnder13 = (date) => {
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age < 13;
    };

    const handleDateClick = (date) => {
        if (!isFutureDate(date) && !isUnder13(date)) {
            const formattedDate = date.toISOString().split('T')[0];
            onDateSelect(formattedDate);
            setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
            const error = validateField('dateOfBirth', formattedDate);
            setErrors(prev => ({ ...prev, dateOfBirth: error }));
        }
    };

    return (
        <div className={`custom-date-picker ${visible ? 'visible' : ''}`}>
            <div className="calendar-header">
                <div className="month-year">
                    {MONTHS[displayedMonth.getMonth()]} {displayedMonth.getFullYear()}
                </div>
                <div className="calendar-nav">
                    <button className="calendar-nav-button prev" onClick={handlePrevMonth}>
                        <Image src="/icons/chevron-right.png" alt="Previous" width={20} height={20} />
                    </button>
                    <button className="calendar-nav-button" onClick={handleNextMonth}>
                        <Image src="/icons/chevron-right.png" alt="Next" width={20} height={20} />
                    </button>
                </div>
            </div>
            <div className="calendar-grid">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="weekday">{day}</div>
                ))}
                {generateCalendarDays().map((day, index) => {
                    const isDisabled = isFutureDate(day.date) || isUnder13(day.date);
                    const isCurrentMonth = day.month === 'current';
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
                            onClick={() => !isDisabled && handleDateClick(day.date)}
                        >
                            {day.day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function RegisterForm({ onBack, language = "en" }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
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
    const [validations, setValidations] = useState({
        firstName: false,
        lastName: false,
        username: false,
        email: false,
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
            
            case "email":
                const isValidEmail = EMAIL_REGEX.test(value);
                setValidations(prev => ({
                    ...prev,
                    email: isValidEmail
                }));
                return isValidEmail ? "" : t.invalidEmail;
            
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
                const date = new Date(value);
                const age = (new Date().getFullYear() - date.getFullYear());
                const isValidAge = age >= 13;
                setValidations(prev => ({
                    ...prev,
                    dateOfBirth: isValidAge
                }));
                return isValidAge ? "" : t.minimumAge;
            
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
            validations.email &&
            Object.values(validations.password).every(Boolean) &&
            validations.confirmPassword &&
            validations.dateOfBirth &&
            validations.gender &&
            !Object.values(errors).some(Boolean) // Check if there are no errors
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!isFormValid()) {
            return;
        }

        // TODO: Submit to backend
        console.log("Registration data:", formData);
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
        setShowDatePicker(prev => !prev);
    };

    const handleDateInputClick = (e) => {
        e.preventDefault();
        setShowDatePicker(true);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.custom-date-picker') && 
                !e.target.closest('.calendar-icon') && 
                !e.target.closest('.date-input')) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
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
                            <input
                                type="email"
                                name="email"
                                placeholder={t.emailPlaceholder}
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? "error" : ""}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
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
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={`date-input ${errors.dateOfBirth ? "error" : ""}`}
                                    max={new Date().toISOString().split("T")[0]}
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
                                    src="/icons/male.png"
                                    alt="Male"
                                    width={24}
                                    height={24}
                                />
                                {t.male}
                            </button>
                            <button
                                type="button"
                                className={`gender-button female ${formData.gender === "F" ? "selected" : ""}`}
                                onClick={() => handleGenderSelect("F")}
                            >
                                <Image
                                    src="/icons/female.png"
                                    alt="Female"
                                    width={24}
                                    height={24}
                                />
                                {t.female}
                            </button>
                        </div>
                        {errors.gender && <span className="error-message text-center">{errors.gender}</span>}

                        <button 
                            type="submit" 
                            className="primary-button"
                            disabled={!isFormValid()}
                        >
                            {t.registerButton}
                        </button>
                    </form>
                </div>

                <CustomDatePicker
                    selectedDate={formData.dateOfBirth}
                    onDateSelect={handleDateSelect}
                    visible={showDatePicker}
                    language={language}
                />

                <div className={`validation-sidebar ${showValidation ? 'visible' : ''}`}>
                    <div className={`validation-item ${validations.firstName ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.firstName ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.firstNameValidation}
                    </div>
                    <div className={`validation-item ${validations.lastName ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.lastName ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.lastNameValidation}
                    </div>
                    <div className={`validation-item ${validations.username ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.username ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.usernameValidation}
                    </div>
                    <div className={`validation-item ${validations.password.length ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.password.length ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.passwordLengthValidation}
                    </div>
                    <div className={`validation-item ${validations.password.uppercase ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.password.uppercase ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.passwordUppercaseValidation}
                    </div>
                    <div className={`validation-item ${validations.password.lowercase ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.password.lowercase ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.passwordLowercaseValidation}
                    </div>
                    <div className={`validation-item ${validations.password.number ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.password.number ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.passwordNumberValidation}
                    </div>
                    <div className={`validation-item ${validations.password.special ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.password.special ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.passwordSpecialValidation}
                    </div>
                    <div className={`validation-item ${validations.password.notCommon ? 'valid' : 'invalid'}`}>
                        <div className="validation-icon">
                            <Image
                                src={validations.password.notCommon ? "/icons/yes.png" : "/icons/no.png"}
                                alt="Validation"
                                width={16}
                                height={16}
                            />
                        </div>
                        {t.passwordCommonValidation}
                    </div>
                </div>
            </div>
        </div>
    );
} 