import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="auth-shell auth-shell--admin">
      <div className="auth-shell__panel">
        <LoginForm
          role="admin"
          title="Admin sign in"
          subtitle="Manage users, projects, and studio operations."
          successPath="/admin"
        />
        <p className="auth-shell__switch">
          Employee?{" "}
          <Link to="/employee/login">Go to employee login</Link>
        </p>
      </div>
    </div>
  );
}
