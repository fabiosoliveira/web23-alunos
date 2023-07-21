import { ethers } from "ethers";
import { Resident, isManager } from "../../services/Web3Service";

type Props = {
  data: Resident;
  onDelete: (wallet: string) => void;
};

/**
 * Renders a single row in the resident table.
 *
 * @param {Props} data - The data object containing information about the resident.
 * @param {Function} onDelete - The function to call when deleting the resident.
 * @return {JSX.Element} The JSX element representing the resident row.
 */
function ResidentRow({ data, onDelete }: Props) {
  function getNextPayment() {
    const dateMs = ethers.BigNumber.from(data.nextPayment).toNumber() * 1000; // convert to milliseconds
    const text = !dateMs ? "Never Payed" : new Date(dateMs).toDateString();
    let color = "text-success";

    if (!dateMs || dateMs < Date.now()) {
      color = "text-danger";
    }

    return <p className={"text-xs mb-0 ms-3 " + color}>{text}</p>;
  }

  // function btnDeleteClick(event: MouseEvent<HTMLAnchorElement, MouseEvent>): void {
  function btnDeleteClick(): void {
    if (window.confirm("Are you sure to delete this resident?")) {
      onDelete(data.wallet);
    }
  }

  return (
    <tr>
      <td>
        <div className="d-flex px-3 py-1">
          <div className="d-flex flex-column justify-content-center">
            <h6 className="mb-0 text-sm">{data.wallet}</h6>
          </div>
        </div>
      </td>
      <td>
        <p className="text-xs font-weight-bold mb-0 px-3">
          {ethers.BigNumber.from(data.residence).toNumber()}
        </p>
      </td>
      <td>
        <p className="text-xs font-weight-bold mb-0 px-3">
          {JSON.stringify(data.isCounselor)}
        </p>
      </td>
      <td>{getNextPayment()}</td>
      <td>
        {isManager() ? (
          <>
            <a
              href={"/residents/edit/" + data.wallet}
              className="btn btn-sm btn-info me-1"
            >
              <i className="material-icons text-sm">edit</i>
            </a>
            <a
              href="#"
              className="btn btn-sm btn-danger me-1"
              onClick={btnDeleteClick}
            >
              <i className="material-icons text-sm">delete</i>
            </a>
          </>
        ) : (
          <></>
        )}
      </td>
    </tr>
  );
}

export default ResidentRow;
