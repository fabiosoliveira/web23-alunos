import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Topics from "./pages/Topics";

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
