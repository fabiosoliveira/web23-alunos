import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doLogin } from "./Web3Service";

function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("account") !== null) {
      redirectAfterLogin(localStorage.getItem("isAdmin") === "true");
    }
  }, []);

  function redirectAfterLogin(isAdmin: boolean) {
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/app");
    }
  }

  function handleButtonClick() {
    setMessage("Loading in...");
    doLogin()
      .then((result) => redirectAfterLogin(result.isAdmin))
      .catch((err) => setMessage(err.message));
  }

  return (
    <>
      <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
        <header className="mb-auto">
          <div>
            <h3 className="float-md-start mb-0">Dapp JoKenPo</h3>
            <nav className="nav nav-masthead justify-content-center float-md-end">
              <a
                className="nav-link fw-bold py-1 px-0 active"
                aria-current="page"
                href="#"
              >
                Home
              </a>
              <a className="nav-link fw-bold py-1 px-0" href="#">
                About
              </a>
            </nav>
          </div>
        </header>

        <main className="px-3">
          <h1>Login and play with us.</h1>
          <p className="lead">Play Rock-Paper-Scissors and earn prizes.</p>
          <p className="lead">
            <a
              href="#"
              onClick={handleButtonClick}
              className="btn btn-lg btn-light fw-bold border-white bg-white"
            >
              <img
                src="src/assets/metamask.svg"
                alt="MetaMask Logo"
                width={48}
              />
              Log in with MetaMask
            </a>
          </p>

          <p className="lead">{message}</p>
        </main>

        <footer className="mt-auto text-white-50">
          <p>
            Build by{" "}
            <a href="https://twitter.com/mdo" className="text-white">
              Fábio Oliveira
            </a>
            .
          </p>
        </footer>
      </div>
    </>
  );
}

export default Login;
