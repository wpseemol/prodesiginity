import { Link } from "react-router-dom";

export default function PortalHomePage() {
  return (
    <div className="portal-home">
      <div className="portal-home__card">
        <p className="portal-home__eyebrow">ProDesignity Dashboard</p>
        <h1>Staff portal</h1>
        <p className="portal-home__lead">
          Choose how you want to sign in.
        </p>
        <div className="portal-home__actions">
          <Link className="portal-home__btn portal-home__btn--admin" to="/admin/login">
            Admin login
          </Link>
          <Link
            className="portal-home__btn portal-home__btn--employee"
            to="/employee/login"
          >
            Employee login
          </Link>
        </div>
      </div>
    </div>
  );
}
