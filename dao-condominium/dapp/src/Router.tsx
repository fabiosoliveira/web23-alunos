import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Topics from "./pages/Topics";
import Transfer from "./pages/Transfer";
import { Profiler, doLogout } from "./services/Web3Service";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/topics"
          element={
            <PrivateRoute>
              <Topics />
            </PrivateRoute>
          }
        />
        <Route
          path="/transfer"
          element={
            <ManagerRoute>
              <Transfer />
            </ManagerRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

type Props = {
  children: React.ReactNode;
};

function PrivateRoute({ children }: Props) {
  const isAuth = localStorage.getItem("account") !== null;
  return isAuth ? children : <Navigate to="/" />;
}

function ManagerRoute({ children }: Props) {
  const isAuth = localStorage.getItem("account") !== null;
  const isManager =
    (localStorage.getItem("profile") || Profiler.RESIDENT) === Profiler.MANAGER;

  if (isAuth && isManager) return children;

  doLogout();
  return <Navigate to="/" />;
}

function CouncilRoute({ children }: Props) {
  const isAuth = localStorage.getItem("account") !== null;
  const isResident =
    (localStorage.getItem("profile") || Profiler.RESIDENT) ===
    Profiler.RESIDENT;

  if (isAuth && !isResident) return children;

  doLogout();
  return <Navigate to="/" />;
}

function ResidentRoute({ children }: Props) {
  const isAuth = localStorage.getItem("account") !== null;
  const isResident =
    (localStorage.getItem("profile") || Profiler.RESIDENT) ===
    Profiler.RESIDENT;

  if (isAuth && isResident) return children;

  doLogout();
  return <Navigate to="/" />;
}
