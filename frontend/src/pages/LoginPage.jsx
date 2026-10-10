import Button from "../components/Button";
import { Link } from "react-router-dom";
import "./LoginPage.css";
import { useState } from "react";
function LoginPage() {
    const [submitStatus, setSubmitStatus] = useState("");
    const [loginData, setLoginData] = useState({
        email: "",
        password:""
    });

    const[errors, setErrors] = useState({
        email:"",
        password:""
    })

    const loginHandler = (event) => {
        const {name, value} = event.target
        
        setLoginData({
            ...loginData,
            [name]: value

        })

        if (errors[name]) {
            setErrors((correctErrors) => ({
                ...correctErrors,
                [name]: ""
            }));
        }
    }

    const validateLogin = () => {
        let valid = true;
        let newErrors = {email: "", password: "" };

        
        if (!loginData.email.endsWith("@gmail.com")) {
            newErrors.email = "Email must be a valid @gmail.com address.";
            valid = false;
        }

        if (loginData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long.";
            valid = false;
        }

        setErrors(newErrors);
        
        return valid;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const isLoginValid = validateLogin();

        if (isLoginValid) {
            setSubmitStatus(`Login  successfully.`);

            setLoginData({ email: "", password: "" });
        } else {
            setSubmitStatus("");
            console.log('Login request was blocked due to errors.');
        }
    };


    return(
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-card h1">Sign In</h1>

                <form onSubmit={handleSubmit}>
                    <p className="login-description">Welcome back! Log in to your DevShelf account to continue.</p>
                    <div className="login-card">

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
                        <label htmlFor="email">Email:</label>
                        <input 
                            id="email"
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={loginHandler} 
                        />
                        <p className="error-msg">{errors.email}</p>
                    </div>

                <div className="login-card">
                    <label id="password" htmlFor="password">Password:</label>
                    <input 
                        id="password"
                        type="password"
                        name="password"
                        value={loginData.password} 
                        onChange={loginHandler}
                    />
                    <p className="error-msg">{errors.password}</p>
                </div>
                
                
                <Button type="submit" variant="primary" className="login-button">Sign in</Button>
                </form>
                <p className="auth-redirect">
                    Don't have an account?  <Link className="auth-link" to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage