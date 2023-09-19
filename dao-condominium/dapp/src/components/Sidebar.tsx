import { useNavigate } from "react-router-dom";
import { Profiler, doLogout } from "../services/Web3Service";
import { useEffect, useState } from "react";

function Sidebar() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profiler>(Profiler.RESIDENT);

  function btnLogoutClick() {
    doLogout();
    navigate("/");
  }

  useEffect(() => {
    const _profile =
      (localStorage.getItem("profile") as Profiler) || Profiler.RESIDENT;
    setProfile(_profile);
  }, []);

  return (
    <aside
      className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark"
      id="sidenav-main"
    >
      <div className="sidenav-header">
        <i
          className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none"
          aria-hidden="true"
          id="iconSidenav"
        ></i>
        <a
          className="navbar-brand m-0"
          href=" https://demos.creative-tim.com/material-dashboard/pages/dashboard "
          target="_blank"
        >
          <img
            src="/logo192.png"
            className="navbar-brand-img h-100"
            alt="main_logo"
          />
          <span className="ms-1 font-weight-bold text-white">Condominium</span>
        </a>
      </div>
      <hr className="horizontal light mt-0 mb-2" />
      <div
        className="collapse navbar-collapse  w-auto "
        id="sidenav-collapse-main"
      >
        <ul className="navbar-nav">
          <MenuItem href="topics" icon="interests" title="Topics" />

          {profile !== Profiler.RESIDENT ? (
            <MenuItem href="residents" icon="group" title="Residents" />
          ) : (
            <></>
          )}
          {profile !== Profiler.MANAGER ? (
            <MenuItem href="quota" icon="payments" title="Quota" />
          ) : (
            <>
              <MenuItem href="settings" icon="settings" title="Settings" />
            </>
          )}
        </ul>
      </div>
      <div className="sidenav-footer position-absolute w-100 bottom-0 ">
        <div className="mx-3">
          <a
            className="btn bg-gradient-primary mt-4 w-100"
            href="#"
            type="button"
            onClick={btnLogoutClick}
          >
            Logout
          </a>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

type MenuItemProps = {
  href: string;
  icon: string;
  title: string;
};

function MenuItem({ href, icon, title }: MenuItemProps) {
  const isActive = window.location.pathname.indexOf(href) !== -1;
  const style = `nav-link text-white ${
    isActive ? "active bg-gradient-primary" : ""
  }`;

  return (
    <li className="nav-item">
      <a className={style} href={`/${href}`}>
        <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
          <i className="material-icons opacity-10">{icon}</i>
        </div>
        <span className="nav-link-text ms-1">{title}</span>
      </a>
    </li>
  );
}
