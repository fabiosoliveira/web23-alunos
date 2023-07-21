type Props = {
  title: string;
  text: string;
  materialIcon?: string;
  alertClass: string;
};

/**
 * Renders an alert component with the given props.
 *
 * @param {Props} title - The title of the alert.
 * @param {Props} text - The text content of the alert.
 * @param {Props} materialIcon - The material icon to be displayed in the alert.
 * @param {Props} alertClass - The custom CSS class for the alert.
 * @return {JSX.Element} The rendered alert component.
 */
function Alert({ title, text, materialIcon, alertClass }: Props) {
  return (
    <div
      className={
        "alert alert-dismissible text-white fade show mx-3 " + alertClass
      }
      role="alert"
    >
      {materialIcon ? (
        <span className="alert-icon align-middle me-2">
          <span className="material-icons text-md">{materialIcon}</span>
        </span>
      ) : (
        <></>
      )}
      <span className="alert-text">
        <strong>{title}</strong> {text}
      </span>
      <button
        type="button"
        className="btn-close"
        data-bs-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}

export default Alert;
