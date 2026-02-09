import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div>
            <h1>HomePage</h1>
            <p>Welcome to NoteDZ0P!</p>

            <nav style={{ display: "flex", gap: "12px" }}>
                <Link to="/notebook/login">Login</Link>
                <Link to="/notebook/register">Register</Link>
            </nav>
        </div>
    );
}