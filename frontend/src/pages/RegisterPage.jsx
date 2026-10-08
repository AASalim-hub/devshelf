import Button from "../components/Button";
function RegisterPage() {
    return(
        <>
        <h1>Create an account</h1>

        <form action="submit">
            <label htmlFor="username">Username:</label>

            <input type="text" /><br /><br />

            <label htmlFor="email">Email:</label>

            <input type="email" /><br /><br />

            <label htmlFor="password">Password:</label>
            
            <input type="text" /><br /><br />

            <Button variant="secondary" type="submit">Sign UP</Button>
        </form>

        </>
    );
}

export default RegisterPage