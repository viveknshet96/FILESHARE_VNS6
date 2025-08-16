import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import logo from "../assets/transfer.gif";

const Header = () => {
  const { state, dispatch } = useContext(AuthContext);
  const { isAuthenticated, user, loading } = state;
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const renderAuthLinks = () => {
    // If on the login page, show register link and guest option
    if (location.pathname === "/login") {
      return (
        <div className="auth-links">
          <Link to="/register" className="auth-link">Register</Link>
          <Link to="/guest" className="btn btn-secondary">
            Continue as Guest
          </Link>
        </div>
      );
    }

    // If on the register page, show login link and guest option
    if (location.pathname === "/register") {
      return (
        <div className="auth-links">
          <Link to="/login" className="auth-link">Login</Link>
          <Link to="/guest" className="btn btn-secondary">
            Continue as Guest
          </Link>
        </div>
      );
    }

    // If on the guest page, show guest info and exit option
    if (location.pathname === "/guest") {
      return (
        <div className="header-user-info">
          <span className="welcome-text">Welcome, Guest User</span>
          <div className="guest-actions">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Register
            </Link>
          </div>
        </div>
      );
    }

    // If the user is authenticated, show user info and logout button
    if (isAuthenticated) {
      return (
        <div className="header-user-info">
          <span className="welcome-text">
            Welcome, {user?.name || user?.email || 'User'}
            {loading && <span className="loading-indicator"> (loading...)</span>}
          </span>
          <button onClick={onLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      );
    }
    
    // Fallback for any other case (user is not authenticated and not on a special page)
    // This handles cases like 404 pages or other routes
    return (
      <div className="auth-links">
        <Link to="/login" className="auth-link">Login</Link>
        <Link to="/register" className="auth-link">Register</Link>
        <Link to="/guest" className="btn btn-secondary">
          Guest Mode
        </Link>
      </div>
    );
  };

  // Determine the logo link destination
  const getLogoDestination = () => {
    if (isAuthenticated) return "/";
    if (location.pathname === "/guest") return "/guest";
    return "/login";
  };

  return (
    <header className="header">
      <Link to={getLogoDestination()} className="logo-link">
        <img src={logo} alt="V'Share Logo" className="logo-image" />
        <span className="logo-text">V'Share</span>
      </Link>

      {renderAuthLinks()}
    </header>
  );
};

export default Header;