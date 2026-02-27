import Home from "./pages/Home";
import ResetPassword from "./components/ResetPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { applyActionCode } from "firebase/auth";
import { auth } from "./services/firebase";

function App() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  const path = window.location.pathname;

  if (path === "/privacy") {
    return <Privacy />;
  }

  if (path === "/terms") {
    return <Terms />;
  }

  if (mode === "resetPassword" && oobCode) {
    return <ResetPassword oobCode={oobCode} />;
  }

  if (mode === "verifyEmail" && oobCode) {
    applyActionCode(auth, oobCode);
  }

  return <Home />;
}

export default App;
