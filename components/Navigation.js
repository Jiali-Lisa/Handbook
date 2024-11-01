import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/search">Search</Link></li>
        <li><Link to="/subject">Subject</Link></li>
      </ul>
    </nav>
  );
}
