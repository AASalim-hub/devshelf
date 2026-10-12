
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api, { getApiError } from "../services/api";
import "./LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const successMessage = location.state?.successMessage;

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ""
        }));

        setSubmitError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setSubmitError("");

        try {
            const response = await api.post("/api/auth/login", {
                email: formData.email.trim(),
                password: formData.password
            });

            const { token, userName } = response.data;

            if (!token) {
                throw new Error("The server did not return an authentication token.");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("userName", userName || "");

            navigate("/", { replace: true });
        } catch (error) {
            setSubmitError(getApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-title">Sign In</h1>

                <p className="login-description">
                    Welcome back! Log in to your DevShelf account to continue.
                </p>

                {successMessage && (
    <div className="login-success" role="status">
        {successMessage}
    </div>
)}

                {submitError && (
                    <div className="login-error" role="alert">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="login-field">
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        {errors.email && (
                            <p className="error-msg">{errors.email}</p>
                        )}
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">Password</label>

                        <div className="password-props">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                            />

                            
<button
    type="button"
    className="password-visibility"
    onClick={() => setShowPassword((value) => !value)}
    aria-label={showPassword ? "Hide password" : "Show password"}
    title={showPassword ? "Hide password" : "Show password"}
>
    {showPassword ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.3 4.5 9 7-.3 1.1-1.1 2.5-2.4 3.7" />
            <path d="M6.2 6.2C3.9 7.7 2.4 10 2 12c.7 2.5 4 7 10 7 1 0 2-.2 2.9-.5" />
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )}
</button>

                        </div>

                        {errors.password && (
                            <p className="error-msg">{errors.password}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>

                <p className="auth-redirect">
                    Don't have an account?{" "}
                    <Link className="auth-link" to="/register">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
