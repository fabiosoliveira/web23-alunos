function Footer() {
  return (
    <footer className="footer py-4  ">
      <div className="container-fluid">
        <div className="row align-items-center justify-content-lg-between">
          <div className="col-lg-6 mb-lg-0 mb-4">
            <div className="copyright text-center text-sm text-muted text-lg-start">
              Build by Fábio Oliveira
            </div>
          </div>
          <div className="col-lg-6">
            <ul className="nav nav-footer justify-content-center justify-content-lg-end">
              <li className="nav-item">
                <a
                  href="https://www.linkedin.com/in/f%C3%A1bio-oliveira-739b48b4/"
                  className="nav-link text-muted"
                  target="_blank"
                >
                  Linkedin
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="https://www.instagram.com/fabiojiquirica/"
                  className="nav-link text-muted"
                  target="_blank"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
