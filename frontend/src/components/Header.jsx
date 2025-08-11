import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import logo from "../assets/logo.png";

const Header = () => {
  const { state, dispatch } = useContext(AuthContext);
  const { isAuthenticated, user } = state;
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const renderAuthLinks = () => {
    // If on the login or register page, always show the public links
    if (location.pathname === "/login" || location.pathname === "/register") {
      return (
        <div className="auth-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      );
    }
    // If on the guest page, always show the guest info
    if (location.pathname === "/guest") {
      return (
        <div className="header-user-info">
          <span>Welcome, Guest</span>
          <Link to="/login" className="btn btn-secondary">
            Exit Guest Mode
          </Link>
        </div>
      );
    }
    // If the user is authenticated...
    if (isAuthenticated) {
      // ...and we have their data, show the welcome message and logout button.
      if (user) {
        return (
          <div className="header-user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={onLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        );
      }
      // ✅ FIX: If authenticated but the user object is still loading, show nothing.
      return null;
    }
    
    // Fallback for any other case (user is not authenticated and not on a special page)
    return (
      <div className="auth-links">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <header className="header">
      <Link to={isAuthenticated ? "/" : "/login"} className="logo-link">
        <img src={logo} alt="V'Share Logo" className="logo-image" />
        <span className="logo-text">V'Share</span>
      </Link>

      {renderAuthLinks()}
    </header>
  );
};

export default Header;