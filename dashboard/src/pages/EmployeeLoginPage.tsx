import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function EmployeeLoginPage() {
  return (
    <div className="auth-shell auth-shell--employee">
      <div className="auth-shell__panel">
        <LoginForm
          role="employer"
          title="Employee sign in"
          subtitle="Access assigned work, briefs, and deliverables."
          successPath="/employee"
        />
        <p className="auth-shell__switch">
          Admin? <Link to="/admin/login">Go to admin login</Link>
        </p>
      </div>
    </div>
  );
}
