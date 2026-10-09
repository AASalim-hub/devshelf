import Button from "../components/Button";
import { Link } from "react-router-dom";
function LoginPage() {
    return(
        <div>
            <div>
                <h1>Login Page</h1>
                <Button variant="primary">Login</Button>
                <p>
                    Don't have an account?  <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage