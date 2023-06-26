import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { mint } from "./Web3Service";

function App() {
  const [message, setMessage] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);

  function handleButtonClick() {
    if (captcha) {
      setMessage("Request your tokens...wait...");
      mint()
        .then((tx) =>
          setMessage(
            `Your tokens were sent to ${localStorage.getItem(
              "wallet"
            )}. Tx: ${tx}`
          )
        )
        .catch((e) => setMessage(e.message));
      setCaptcha(null);
    } else {
      setMessage("Check the 'I am not robot' box first");
    }
  }

  return (
    <>
      <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
        <header className="mb-auto">
          <div>
            <h3 className="float-md-start mb-0">Protocoin Faucet</h3>
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
          <h1>Get your Protocoins</h1>
          <p className="lead">
            Once a day, earn 10.000 coins for free just connecting your MetaMask
            bellow.
          </p>
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
              Get my tokens
            </a>
          </p>
          <div style={{ display: "inline-flex" }}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_APP_RECAPTCHA_KEY}
              onChange={setCaptcha}
            />
          </div>
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

export default App;
