import { useState } from "react";
import Button from "../components/Button";
function RegisterPage() {
    const [formData, setFormData] = useState({
        username:"",
        email:"",
        password:""
    });

    const handleChange = (event) => {
        const {name, value} = event.target;

        setFormData((updateData) => ({
            ...updateData,
            [name]: value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form Submitted successfully:', formData)
    }
    return(
        <>
        <h1>Create an account</h1>

        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>

            <input 
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange} 
            required/><br /><br />

            <label htmlFor="email">Email:</label>

            <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange} 
            required/><br /><br />

            <label htmlFor="password">Password:</label>

            <input 
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange} 
            required/><br /><br />

            <Button variant="secondary" type="submit">Sign UP</Button>
        </form>

        </>
    );
}

export default RegisterPage