import { useAuth } from "./context/AuthContext";

import DashboardLayout from "./layouts/DashboardLayout";
import EmployeeLogin from "./components/EmployeeLogin";

import "./app.css";

function App() {
  const { user } = useAuth();

  if (!user) {
    return <EmployeeLogin />;
  }

  return <DashboardLayout />;
}

export default App;
