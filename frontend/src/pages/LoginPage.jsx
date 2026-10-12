
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import api, { getApiError } from "../services/api";
import "./LoginPage.css";

function LoginPage() {
    const navigate = useNavigate();

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
                            >
                                {showPassword ? "Hide" : "Show"}
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
