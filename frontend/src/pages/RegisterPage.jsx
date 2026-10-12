
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api, { getApiError } from "../services/api";
import "./RegisterPage.css";

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
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
        setSuccessMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};

        if (formData.username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters long.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Enter a valid email address.";
        }

        if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setSubmitError("");
        setSuccessMessage("");

        try {
            const response = await api.post("/api/auth/register", {
                userName: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            setSuccessMessage(
    response.data?.message || "Account created successfully!"
);

setFormData({
    username: "",
    email: "",
    password: ""
});

navigate("/login", {
    replace: true,
    state: {
        successMessage: "Account created successfully. Please sign in."
    }
});
        } catch (error) {
            setSubmitError(getApiError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h1>Create an account</h1>

                <p className="register-description">
                    Create your DevShelf account to get started.
                </p>

                {submitError && (
                    <div className="register-error" role="alert">
                        {submitError}
                    </div>
                )}

                {successMessage && (
                    <div className="register-success" role="status">
                        {successMessage}
                        {" "}
                        <Link to="/login" className="auth-link">
                            Sign in now
                        </Link>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label htmlFor="username">Username</label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            autoComplete="username"
                            value={formData.username}
                            onChange={handleChange}
                        />

                        {errors.username && (
                            <p className="error-msg">{errors.username}</p>
                        )}
                    </div>

                    <div className="form-field">
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

                    <div className="form-field">
                        <label htmlFor="password-input">Password</label>

                        <div className="register-password-field">
                            <input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                autoComplete="new-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="At least 8 characters"
                            />

                            
<button
    type="button"
    className="register-password-toggle"
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
                        variant="primary"
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Sign up"}
                    </Button>
                </form>

                <p className="auth-redirect">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
