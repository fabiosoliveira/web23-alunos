import { Category, Status, Topic, isManager } from "../../services/Web3Service";
import If from "../../components/If";

type Props = {
  data: Topic;
  onDelete: (wallet: string) => void;
};

/**
 * Renders a table row for a topic.
 *
 * @param {Props} { data, onDelete } - An object containing the topic data and a callback function for deleting the topic.
 * @return {JSX.Element} - The rendered table row.
 */
function TopicRow({ data, onDelete }: Props) {
  function getDate() {
    if (!data.createdDate) return "";
    const dateMs = data.createdDate * 1000;

    return (
      <p className={"text-xs mb-0 ms-3"}>{new Date(dateMs).toDateString()}</p>
    );
  }

  function btnDeleteClick(): void {
    if (window.confirm("Are you sure to delete this topic?")) {
      onDelete(data.title);
    }
  }

  function getCategory() {
    let text = "";
    switch (data.category) {
      case Category.DECISION:
        text = "Decision";
        break;
      case Category.SPENT:
        text = "Spent";
        break;
      case Category.CHANGE_MANAGER:
        text = "Change Manager";
        break;
      case Category.CHANGE_QUOTA:
        text = "Change Quota";
        break;
    }
    return <p className="text-xs mb-0 ms-3">{text}</p>;
  }

  function getStatus() {
    let text = "",
      className = "";
    switch (data.status) {
      case Status.APPROVED:
        text = "Approved";
        className = "badge bg-success py-1 ms-3";
        break;
      case Status.DENIED:
        text = "Denied";
        className = "badge bg-danger py-1 ms-3";
        break;
      case Status.DELETED:
        text = "Deleted";
        className = "badge bg-danger py-1 ms-3";
        break;
      case Status.SPENT:
        text = "Spent";
        className = "badge bg-success py-1 ms-3";
        break;
      case Status.VOTING:
        text = "Voting";
        className = "badge bg-warning py-1 ms-3";
        break;
      default:
        text = "Idle";
        className = "badge bg-secondary py-1 ms-3";
        break;
    }
    return <span className={className}>{text}</span>;
  }

  return (
    <tr>
      <td>
        <div className="d-flex px-3 py-1">
          <div className="d-flex flex-column justify-content-center">
            <h6 className="mb-0 text-sm">{data.title}</h6>
          </div>
        </div>
      </td>
      <td>{getCategory()}</td>
      <td>{getStatus()}</td>
      <td>{getDate()}</td>
      <td>
        <a
          href={"/topics/edit/" + data.title}
          className="btn btn-sm btn-info me-1"
        >
          <i className="material-icons text-sm">visibility</i>
        </a>
        <If condition={isManager() && data.status === Status.IDLE}>
          <a
            href="#"
            className="btn btn-sm btn-danger me-1"
            onClick={btnDeleteClick}
          >
            <i className="material-icons text-sm">delete</i>
          </a>
        </If>
      </td>
    </tr>
  );
}

export default TopicRow;
