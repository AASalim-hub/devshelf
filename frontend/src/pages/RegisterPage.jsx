import { useState } from "react";
import Button from "../components/Button";
import "./RegisterPage.css";
import {Link} from "react-router-dom";

function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [submitStatus, setSubmitStatus] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState({
        username: "",
        email: "",
        password: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((updateData) => ({
            ...updateData,
            [name]: value,
        }));

        if (error[name]) {
            setError((correctErrors) => ({
                ...correctErrors,
                [name]: ""
            }));
        }

        if (submitStatus) {
        setSubmitStatus("");
    }
    };

    

    const validateForm = () => {
        let valid = true;
        let newErrors = { username: "", email: "", password: "" };

        if (formData.username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters long.";
            valid = false;
        }

        if (!formData.email.endsWith("@gmail.com")) {
            newErrors.email = "Email must be a valid @gmail.com address.";
            valid = false;
        }

        if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
            valid = false;
        }

        setError(newErrors);
        
        return valid; 
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const isFormValid = validateForm();

        if (isFormValid) {
            setSubmitStatus(`Welcome, ${formData.username}! Your account has been created successfully.`);

            setFormData({ username: "", email: "", password: "" });
        } else {
            setSubmitStatus("");
            console.log('Form submission blocked due to errors.');
        }
    };

    const showPasswordToggle = () => {
        setShowPassword((show) => !show);
    }
    return(
        <div className="register-page">
            <div className="register-card">
                <h1>Create an account</h1>
                <p className="register-description">Create your DevShelf account to get started.</p>

                {submitStatus && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgb(34, 197, 94)',
                        borderRadius: '8px',
                        color: 'rgb(21, 128, 61)',
                        fontSize: '14px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {submitStatus}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
            
                    <div className="form-field">
                         <label htmlFor="username">Username:</label>
                        <input 
                        id="username"
                         type="text"
                         name="username"
                        value={formData.username}
                         onChange={handleChange}/>
                        <p className="error-msg">{error.username}</p>
                    </div>

                    <div className="form-field">
                        <label htmlFor="email">Email:</label>
                        <input 
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}/>
                        <p className="error-msg"    >{error.email}</p>
                    </div>

                    <div className="form-field">
                        <label htmlFor="password-input">Password:</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                id="password-input"
            
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={showPasswordToggle}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: '0'
                                }}
                            >
                                {showPassword ? "👁️" : "👁️"}
                            </button>
                        </div>
    
                        {error.password && <p className="error-msg">{error.password}</p>}
                    </div>

                    <Button variant="secondary" type="submit" className={"register-button"}>Sign UP</Button>
                </form>


                <p className="auth-redirect">
                    Already have an account? <Link to="/login" className="auth-link">Login here</Link>
                </p>

            </div>
        </div>
    );
}

export default RegisterPage