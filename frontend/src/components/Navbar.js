"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { IoLogIn, IoLogOut, IoChevronDown } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import Image from 'next/image';
import { HiUserAdd } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { useEffect, useState } from "react";
import SunnyIcon from '@mui/icons-material/Sunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import "@/styles/Navbar.css";
import styles1 from '@/styles/NewBookingPage.module.css';
import { useTheme } from '../context/ThemeContext';
import { useScreen } from "@/context/ScreenProvider";

export default function Navbar() {
  const isMobile = useScreen();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingDropdownOpen, setBookingDropdownOpen] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <main className={styles1.LoadingDiv}>
    <p className={styles1.LoadingPara}>Loading...</p>
  </main>;

  const toggleBookingDropdown = () => {
    setBookingDropdownOpen(!bookingDropdownOpen);
  };

  return (
    <nav className='navbar'>
      <div className='logo'>
        <Link href="/">
          <Image
            src={"/images/logo.png"}
            alt={"healthcare logo"}
            width={70}
            height={70}
            priority
          />
        </Link>
      </div>

      <div className='burger' onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <IoClose size={24} /> : <GiHamburgerMenu size={24} />}
      </div>

      <div className={`links ${menuOpen ? `active` : ""}`}>
        {user ? (
          <>
            {user.role === "doctor" && (
              <>
                <button
                  onClick={toggleTheme}
                  style={{
                    marginBottom:  `${isMobile?'0.5rem':''}`,
                    display: "inline",
                    fontSize: "1rem",
                    color: `${theme === 'light' ? "black" : "white"}`,
                    borderRadius: "2rem",
                    marginRight: `${isMobile?'13rem':''}`,
                    textTransform: "capitalize",
                    fontWeight: "800"
                  }}
                >{theme === 'light' ? (<><NightlightIcon/></>):(<><SunnyIcon/></>)}</button>
                <div
                  className={`dropdown ${bookingDropdownOpen ?'active' : ""}`}
                  onMouseEnter={() => !menuOpen && setBookingDropdownOpen(true)}
                  onMouseLeave={() => !menuOpen && setBookingDropdownOpen(false)}
                >
                  <button
                    onClick={toggleBookingDropdown}
                    className='dropdownToggle'
                  >
                    Bookings <IoChevronDown className='dropdownArrow' />
                  </button>
                  <div className='dropdownContent'>
                    <Link href="/doctor/appointments" onClick={() => {
                      setMenuOpen(false);
                      setBookingDropdownOpen(false);
                    }}>
                      View Bookings
                    </Link>
                    <Link href="/doctor/slots" onClick={() => {
                      setMenuOpen(false);
                      setBookingDropdownOpen(false);
                    }}>
                      Manage Slots
                    </Link>
                  </div>
                </div>
              </>
            )}

            {user.role === "patient" && (
              <>
                <button
                  onClick={toggleTheme}
                  style={{
                    marginBottom:  `${isMobile?'0.5rem':''}`,
                    display: "inline",
                    fontSize: "1rem",
                    color: `${theme === 'light' ? "black" : "white"}`,
                    borderRadius: "2rem",
                    marginRight: `${isMobile?'13rem':''}`,
                    textTransform: "capitalize",
                    fontWeight: "800"
                  }}
                >{theme === 'light' ? (<><NightlightIcon/></>):(<><SunnyIcon/></>)}</button>
                <div
                  className={`dropdown ${bookingDropdownOpen ? `active` : ""}`}
                  onMouseEnter={() => !menuOpen && setBookingDropdownOpen(true)}
                  onMouseLeave={() => !menuOpen && setBookingDropdownOpen(false)}
                >
                  <button
                    onClick={toggleBookingDropdown}
                    className='dropdownToggle'
                  >
                    Bookings <IoChevronDown className='dropdownArrow' />
                  </button>
                  <div className='dropdownContent'>
                    <Link href="/patients/new-booking" onClick={() => {
                      setMenuOpen(false);
                      setBookingDropdownOpen(false);
                    }}>
                      Book Appointment
                    </Link>
                    <Link href="/patients/view-bookings" onClick={() => {
                      setMenuOpen(false);
                      setBookingDropdownOpen(false);
                    }}>
                      My Bookings
                    </Link>
                    <Link href="/patients/doctors" onClick={() => {
                      setMenuOpen(false);
                      setBookingDropdownOpen(false);
                    }}>
                      View Doctors
                    </Link>
                  </div>
                </div>
              </>
            )}

            <Link href="/profile/me"
              onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
            <button
              title="logout"
              className='logout'
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            >
              <IoLogOut /> <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/users/login" onClick={() => setMenuOpen(false)}>
              <IoLogIn /> <span>Login</span>
            </Link>
            <Link href="/users/register" onClick={() => setMenuOpen(false)}>
              <HiUserAdd /> <span>Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}