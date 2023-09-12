import { ChangeEvent, useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import SwitchInput from "../../components/SwitchInput";
import {
  Profiler,
  Resident,
  addResident,
  doLogout,
  getResident,
  isManager,
  isResident,
  setCouncelor,
} from "../../services/Web3Service";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import {
  ApiResident,
  getApiResident,
  addApiResident,
  updateApiResident,
} from "../../services/ApiService";

const RESIDENT_INITIAL_STATE = {
  isCounselor: false,
  isManager: false,
  nextPayment: 0,
  residence: 0,
  wallet: "",
} as Resident;

function ResidentPage() {
  const navigate = useNavigate();
  const { wallet } = useParams();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resident, setResident] = useState<Resident>(RESIDENT_INITIAL_STATE);
  const [apiResident, setApiResident] = useState<ApiResident>(
    {} as ApiResident
  );

  function onResidentChange(event: ChangeEvent<HTMLInputElement>): void {
    const { id, value } = event.target;
    setResident((resident) => ({ ...resident, [id]: value }));
  }

  function onApiResidentChange(event: ChangeEvent<HTMLInputElement>): void {
    const { id, value } = event.target;
    setApiResident((resident) => ({ ...resident, [id]: value }));
  }

  function btnSaveClick() {
    if (!resident.wallet) return;

    setMessage("Connecting to wallet...wait...");
    if (!wallet) {
      const promiseBlockchain = addResident(
        resident.wallet,
        resident.residence
      );
      const promiseBackend = addApiResident({
        ...apiResident,
        profile: Profiler.RESIDENT,
        wallet: resident.wallet,
      });
      Promise.all([promiseBlockchain, promiseBackend])
        .then((results) => navigate("/residents?tx=" + results[0].hash))
        .catch((err) => {
          if (err instanceof Error) setMessage(err.message);
        });
    } else {
      const profile: Profiler = resident.isCounselor
        ? Profiler.COUNSELOR
        : Profiler.RESIDENT;
      const promises = [];
      if (apiResident.profile !== profile) {
        promises.push(setCouncelor(resident.wallet, resident.isCounselor));
      }

      promises.push(
        updateApiResident(wallet, { ...apiResident, profile, wallet })
      );
      Promise.all(promises)
        .then((results) => navigate("/residents?tx=" + wallet))
        .catch((err) => {
          if (err instanceof Error) setMessage(err.message);
        });
    }
  }

  function getNextPayment() {
    const dateMs = (resident.nextPayment as number) * 1000; // convert to milliseconds
    if (!dateMs) return "Never Payed";
    return new Date(dateMs).toDateString();
  }

  function getNextPaymentClass() {
    const className = "input-group input-group-outline ";
    const dateMs = (resident.nextPayment as number) * 1000;
    if (!dateMs || dateMs < Date.now()) return className + "is-invalid";
    return className + "is-valid";
  }

  useEffect(() => {
    if (isResident()) {
      doLogout();
      navigate("/");
    }

    if (wallet) {
      setIsLoading(true);

      const promiseBlockchain = getResident(wallet);
      const promiseBackend = getApiResident(wallet);

      Promise.all([promiseBlockchain, promiseBackend])
        .then((results) => {
          setResident(results[0]);
          setApiResident(results[1]);
        })
        .catch((err) => {
          if (err instanceof Error) setMessage(err.message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [wallet]);

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
                      <i className="material-icons opacity-10 me-2">group</i>
                      {wallet ? "Edit " : "New "} Resident
                    </h6>
                  </div>
                </div>
                <div className="card-body px-0 pb-2">
                  {isLoading ? <Loader /> : <></>}
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="wallet">Wallet Address:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="text"
                            className="form-control"
                            id="wallet"
                            value={resident.wallet}
                            placeholder="0x00..."
                            disabled={!!wallet}
                            onChange={onResidentChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="residence">
                          Residence Id: (block+apartment)
                        </label>
                        <div className="input-group input-group-outline">
                          <input
                            type="number"
                            className="form-control"
                            id="residence"
                            value={resident.residence}
                            placeholder="1101"
                            disabled={!!wallet}
                            onChange={onResidentChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={apiResident.name || ""}
                            onChange={onApiResidentChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="phone">Phone:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            value={apiResident.phone || ""}
                            placeholder="+555123456789"
                            onChange={onApiResidentChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="email">E-mail:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={apiResident.email || ""}
                            placeholder="name@company.com"
                            onChange={onApiResidentChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {wallet ? (
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label htmlFor="nextPayment">Next Payment:</label>
                          <div className={getNextPaymentClass()}>
                            <input
                              type="text"
                              className="form-control"
                              id="nextPayment"
                              value={getNextPayment()}
                              disabled={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  {isManager() && wallet ? (
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <SwitchInput
                            id="isCounselor"
                            isChecked={resident.isCounselor}
                            text="Is Counselor?"
                            onChange={onResidentChange}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className="row ms-3">
                    <div className="col-md-12 mb-3">
                      <button
                        className="btn bg-gradient-dark me-2"
                        onClick={btnSaveClick}
                      >
                        <i className="material-icons opacity-10 me-2">save</i>
                        Save Resident
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

export default ResidentPage;
