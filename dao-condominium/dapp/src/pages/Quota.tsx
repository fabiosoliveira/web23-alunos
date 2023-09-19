import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  payQuota,
  Resident,
  getResident,
  getQuota,
} from "../services/Web3Service";
import Footer from "../components/Footer";
import If from "../components/If";
import Loader from "../components/Loader";
import { ethers } from "ethers";

function Quota() {
  const [resident, setResident] = useState<Resident>({} as Resident);
  const [quota, setQuota] = useState<ethers.BigNumberish>(0n);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function btnPayQuotaClick(): void {
    setIsLoading(true);
    setMessage("Connecting to wallet...waiit...");
    payQuota(resident.residence, quota)
      .then(() =>
        setMessage("Quota paid! It may take some minuts to have effect.")
      )
      .catch((err) => {
        if (err instanceof Error) setMessage(err.message);
      })
      .finally(() => setIsLoading(false));
  }

  function getDate(timestamp: number) {
    const dateMs = ethers.toNumber(timestamp) * 1000;
    if (!dateMs) return "Never Payed";
    return new Date(dateMs).toDateString();
  }

  useEffect(() => {
    setIsLoading(true);
    const quotaPromise = getQuota();
    const residentPromise = getResident(localStorage.getItem("account") || "");
    Promise.all([quotaPromise, residentPromise])
      .then((results) => {
        setQuota(results[0]);
        setResident(results[1]);
      })
      .catch((err) => {
        if (err instanceof Error) setMessage(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function getNextPaymentClass(): string {
    const className = "input-group input-group-outline";
    const dateMs = ethers.toNumber(resident.nextPayment) * 1000;
    if (!dateMs || dateMs < Date.now()) return className + "is-invalid";
    return className + "is-valid";
  }

  function shouldPay(): boolean {
    return ethers.toNumber(resident.nextPayment) * 1000 <= Date.now();
  }

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
                      <i className="material-icons opacity-10 me-2">payments</i>
                      Quota
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
                        <label htmlFor="quota">Montlhy Quota (ETH):</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="number"
                            className="form-control"
                            id="quota"
                            value={ethers.formatEther(quota)}
                            disabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="residenceId">
                          Residence (block+apt):
                        </label>
                        <div className="input-group input-group-outline">
                          <input
                            type="number"
                            className="form-control"
                            id="residenceId"
                            value={resident.residence}
                            disabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="nextpayment">Next Payment:</label>
                        <div className={getNextPaymentClass()}>
                          <input
                            type="text"
                            className="form-control"
                            id="nextpayment"
                            value={getDate(resident.nextPayment as number)}
                            disabled={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-12 mb-3">
                      <If condition={shouldPay()}>
                        <button
                          className="btn bg-gradient-dark me-2"
                          onClick={btnPayQuotaClick}
                        >
                          <i className="material-icons opacity-10 me-2">save</i>
                          Pay Quota
                        </button>
                      </If>
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

export default Quota;
