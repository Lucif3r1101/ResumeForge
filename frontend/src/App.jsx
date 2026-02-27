import Home from "./pages/Home";
import ResetPassword from "./components/ResetPassword";
import { applyActionCode } from "firebase/auth";
import { auth } from "./services/firebase";

function App() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");

  if (mode === "resetPassword" && oobCode) {
    return <ResetPassword oobCode={oobCode} />;
  }

  if (mode === "verifyEmail" && oobCode) {
    applyActionCode(auth, oobCode);
  }

  return <Home />;
}

export default App;
