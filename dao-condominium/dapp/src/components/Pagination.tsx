import { ethers } from "ethers";
import If from "./If";
import { Link, useLocation } from "react-router-dom";

type Props = {
  count: ethers.BigNumber;
  pageSize: number;
};

function Pagination({ count, pageSize }: Props) {
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const query = useQuery();

  function getPageLink(page: number): string {
    return `${window.location.pathname}?page=${page}`;
  }

  function getPageClass(page: number): string | undefined {
    const queryPage = parseInt(query.get("page") || "1");
    const isActive = page === queryPage || (!queryPage && page === 1);
    return isActive ? "page-item active" : "page-item";
  }

  function getBottom() {
    if (count.toNumber() > 0) {
      return (
        <div className="fw-normal small mt-4 mt-lg-0">
          <b>{count.toNumber()}</b> result(s).
        </div>
      );
    }

    return (
      <div className="fw-normal small mt-4 mt-lg-0">
        <b>No results found!</b> Create one first.
      </div>
    );
  }

  const pagesQty = Math.ceil(count.toNumber() / pageSize);
  const pages = Array.from({ length: pagesQty }, (_, index) => index + 1);

  return (
    <div className="card-footer px-3 border-0 d-flex flex-column flex-lg-row align-items-center justify-content-between">
      <nav aria-label="Page navigation example">
        <ul className="pagination mb-0">
          <If condition={pages && pages.length}>
            {pages.map((page) => (
              <li key={page} className={getPageClass(page)}>
                <Link className="page-link" to={getPageLink(page)}>
                  {page}
                </Link>
              </li>
            ))}
          </If>
        </ul>
      </nav>
      {getBottom()}
    </div>
  );
}

export default Pagination;
