import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getAddress, getBalance, upgrade } from "../services/Web3Service";
import Footer from "../components/Footer";
import If from "../components/If";
import Loader from "../components/Loader";

function Settings() {
  const [contract, setContrac] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState("");

  function btnSaveClick(): void {
    setMessage("Saving data...waiit...");
    upgrade(contract)
      .then(() =>
        setMessage("Settings saved! It may take some minuts to have effect.")
      )
      .catch((err) => {
        if (err instanceof Error) setMessage(err.message);
      });
  }

  useEffect(() => {
    setIsLoading(true);
    getAddress()
      .then((address) => {
        setContrac(address);
        return getBalance();
      })
      .then((balance) => setBalance(balance))
      .catch((err) => {
        if (err instanceof Error) setMessage(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Sidebar />
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card my-4">
                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                  <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                    <h6 className="text-white text-capitalize ps-3">
                      <i className="material-icons opacity-10 me-2">settings</i>
                      Settings
                    </h6>
                  </div>
                </div>
                <div className="card-body px-0 pb-2">
                  <If condition={isLoading}>
                    <Loader />
                  </If>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="balance">
                          Condominium Balance (ETH):
                        </label>
                        <div className="input-group input-group-outline">
                          <input
                            type="number"
                            className="form-control"
                            id="balance"
                            value={balance}
                            disabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="adapter">Adapter Address:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="text"
                            className="form-control"
                            id="adapter"
                            value={
                              import.meta.env.VITE_APP_ADAPTER_ADDRESS as string
                            }
                            disabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="contract">Contract Address:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="text"
                            className="form-control"
                            id="contract"
                            value={contract}
                            onChange={(e) => setContrac(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-12 mb-3">
                      <button
                        className="btn bg-gradient-dark me-2"
                        onClick={btnSaveClick}
                      >
                        <i className="material-icons opacity-10 me-2">save</i>
                        Save Settings
                      </button>
                      <span className="text-danger">{message}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </main>
    </>
  );
}

export default Settings;
