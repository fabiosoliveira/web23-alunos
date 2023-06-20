import { mint } from "./Web3Service";

function App() {
  function handleButtonClick() {
    mint()
      .then(console.log)
      .catch((e) => alert(e.message));
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
            Once a day, earn 1.000 coins for free just connecting your MetaMask
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
              Connect MetaMask
            </a>
          </p>
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
