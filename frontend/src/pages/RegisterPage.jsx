import { useState } from "react";
import Button from "../components/Button";

function RegisterPage() {
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
            console.log('Form Submitted successfully:', formData);
        } else {
            console.log('Form submission blocked due to errors.');
        }
    };
    return(
        <>
        <h1>Create an account</h1>

        <form onSubmit={handleSubmit}>
            
            <div>
                <label htmlFor="username">Username:</label>
                <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}/>
            <p className="error-msg">{error.username}</p>
            </div>

            <div>
                <label htmlFor="email">Email:</label>
                <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}/>
                <p className="error-msg">{error.email}</p>
            </div>

            <div>
                <label htmlFor="password">Password:</label>
                <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}/>
                <p className="error-msg">{error.password}</p>
            </div>

            <Button variant="secondary" type="submit">Sign UP</Button>
        </form>

        </>
    );
}

export default RegisterPage