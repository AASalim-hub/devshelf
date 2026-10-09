import "./Button.css";
function Button({ children, variant = "primary", type = "button", onClick, className=""}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;