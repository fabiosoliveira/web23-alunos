import { ChangeEvent, useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import {
  Category,
  Status,
  Topic,
  editTopic,
  getTopic,
  addTopic,
  isManager,
} from "../../services/Web3Service";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import If from "../../components/If";
import TopicCategory from "../../components/TopicCategory";

function TopicPage() {
  const navigate = useNavigate();
  const { title } = useParams();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState<Topic>({} as Topic);

  function onTopicChange(event: ChangeEvent<HTMLInputElement>): void {
    const { id, value } = event.target;
    setTopic((resident) => ({ ...resident, [id]: value }));
  }

  function btnSaveClick() {
    if (!topic) return;

    setMessage("Connecting to wallet...wait...");
    if (!title) {
      addTopic(topic)
        .then((results) => navigate("/topics?tx=" + results.hash))
        .catch((err) => {
          if (err instanceof Error) setMessage(err.message);
        });
    } else {
      editTopic(title, topic.description, topic.amount, topic.responsible)
        .then((tx) => navigate("/topics?tx=" + tx.hash))
        .catch((err) => {
          if (err instanceof Error) setMessage(err.message);
        });
    }
  }

  function getDate(timestamp: number) {
    const dateMs = timestamp * 1000; // convert to milliseconds
    if (!dateMs) return "";
    return new Date(dateMs).toDateString();
  }

  function getStatus() {
    switch (topic.status) {
      case Status.APPROVED:
        return "APPROVED";
      case Status.DENIED:
        return "DENIED";
      case Status.DELETED:
        return "DELETED";
      case Status.SPENT:
        return "SPENT";
      case Status.VOTING:
        return "VOTING";
      default:
        return "IDLE";
    }
  }

  function showResponsible() {
    const category = parseInt(`${topic.category}`);
    return [Category.SPENT, Category.CHANGE_MANAGER].includes(category);
  }

  function showAmount() {
    const category = parseInt(`${topic.category}`);
    return [Category.SPENT, Category.CHANGE_QUOTA].includes(category);
  }

  function isClosed() {
    const status = parseInt(`${topic.status || 0}`);
    return [
      Status.APPROVED,
      Status.DENIED,
      Status.DELETED,
      Status.SPENT,
    ].includes(status);
  }

  function isDisabled() {
    return !!title && (topic.status !== Status.IDLE || !isManager());
  }

  useEffect(() => {
    if (title) {
      setIsLoading(true);

      getTopic(title)
        .then((topic) => setTopic(topic))
        .catch((err) => {
          if (err instanceof Error) setMessage(err.message);
        })
        .finally(() => setIsLoading(false));
    } else {
      topic.responsible = localStorage.getItem("account") || "";
    }
  }, [title]);

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
                      <i className="material-icons opacity-10 me-2">
                        interests
                      </i>
                      {title ? "Edit " : "New "} Topic
                    </h6>
                  </div>
                </div>
                <div className="card-body px-0 pb-2">
                  {isLoading ? <Loader /> : <></>}
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="text"
                            className="form-control"
                            id="title"
                            value={topic.title || ""}
                            placeholder="Would be great..."
                            disabled={!!title}
                            onChange={onTopicChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <div className="input-group input-group-outline">
                          <input
                            type="text"
                            className="form-control"
                            id="description"
                            value={topic.description}
                            placeholder="..."
                            disabled={isDisabled()}
                            onChange={onTopicChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <If condition={title}>
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label htmlFor="status">Status:</label>
                          <div className="input-group input-group-outline">
                            <input
                              type="text"
                              className="form-control"
                              id="status"
                              value={getStatus()}
                              disabled={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </If>
                  <div className="row ms-3">
                    <div className="col-md-6 mb-3">
                      <div className="form-group">
                        <label htmlFor="category">Category:</label>
                        <div className="input-group input-group-outline">
                          <TopicCategory
                            value={topic.category}
                            onChange={onTopicChange}
                            disabled={!!title}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <If condition={showResponsible()}>
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label htmlFor="responsible">Responsible:</label>
                          <div className="input-group input-group-outline">
                            <input
                              type="text"
                              className="form-control"
                              id="responsible"
                              value={topic.responsible || ""}
                              placeholder="0x000..."
                              onChange={onTopicChange}
                              disabled={isDisabled()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </If>
                  <If condition={showAmount()}>
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label htmlFor="amount">Amount (wei):</label>
                          <div className="input-group input-group-outline">
                            <input
                              type="number"
                              className="form-control"
                              id="amount"
                              value={topic.amount?.toString() || "0"}
                              placeholder="0"
                              onChange={onTopicChange}
                              disabled={isDisabled()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </If>
                  <If condition={title}>
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label htmlFor="createdDate">Created Date:</label>
                          <div className="input-group input-group-outline">
                            <input
                              type="text"
                              className="form-control"
                              id="createdDate"
                              value={getDate(topic.createdDate || 0)}
                              disabled={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </If>
                  <If condition={isClosed() || topic.status === Status.VOTING}>
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label htmlFor="startDate">Start Date:</label>
                          <div className="input-group input-group-outline">
                            <input
                              type="text"
                              className="form-control"
                              id="startDate"
                              value={getDate(topic.startDate || 0)}
                              disabled={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </If>
                  <If condition={isClosed()}>
                    <div className="row ms-3">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label htmlFor="endDate">End Date:</label>
                          <div className="input-group input-group-outline">
                            <input
                              type="text"
                              className="form-control"
                              id="endDate"
                              value={getDate(topic.endDate || 0)}
                              disabled={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </If>

                  <If
                    condition={
                      !title || (isManager() && topic.status === Status.IDLE)
                    }
                  >
                    <div className="row ms-3">
                      <div className="col-md-12 mb-3">
                        <button
                          className="btn bg-gradient-dark me-2"
                          onClick={btnSaveClick}
                        >
                          <i className="material-icons opacity-10 me-2">save</i>
                          Save Topic
                        </button>
                        <span className="text-danger">{message}</span>
                      </div>
                    </div>
                  </If>
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

export default TopicPage;
