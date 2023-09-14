import { Status, isManager } from "../../services/Web3Service";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";

import If from "../../components/If";

type Props = {
  fileName: string;
  topicTitle: string;
  status?: Status;
  onDelete: (fileName: string) => void;
};

/**
 * Renders a single row in the topic file table.
 *
 * @param {Object} props - The props for the component.
 * @param {string} props.fileName - The name of the file.
 * @param {string} props.status - The status of the file.
 * @param {string} props.topicTitle - The title of the topic.
 * @param {Function} props.onDelete - The function to call when the delete button is clicked.
 * @return {JSX.Element} The rendered row.
 */
function TopicFileRow({ fileName, status, topicTitle, onDelete }: Props) {
  function btnDeleteClick(): void {
    if (window.confirm("Are you sure to delete this file?")) {
      onDelete(fileName);
    }
  }

  function getTopicFileUrl() {
    const hash = keccak256(toUtf8Bytes(topicTitle));
    const api_url = import.meta.env.VITE_APP_API_URL as string;
    const token = localStorage.getItem("token") || "";

    return `${api_url}/topicfiles/${hash}/${fileName}?token=${token}`;
  }

  return (
    <tr>
      <td>
        <a href={getTopicFileUrl()} target="_blank" className="ms-3">
          {fileName}
        </a>
      </td>
      <td>
        <a
          href={getTopicFileUrl()}
          target="_blank"
          className="btn btn-success btn-sm me-1 mb-0"
        >
          <i className="material-icons text-sm">cloud_download</i>
        </a>

        <If condition={isManager() && status === Status.IDLE}>
          <a
            href="#"
            className="btn btn-sm btn-danger me-1 mb-0"
            onClick={btnDeleteClick}
          >
            <i className="material-icons text-sm">delete</i>
          </a>
        </If>
      </td>
    </tr>
  );
}

export default TopicFileRow;
