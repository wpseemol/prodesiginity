import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-shell__panel">
        <LoginForm />
      </div>
    </div>
  );
}
