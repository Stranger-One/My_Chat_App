import React from "react";

const Button = ({
  children,
  className = "",
  onClick,
  type = "button",
  bg = "bg-primary",
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`${bg} ${className} px-4 py-2 font-semibold rounded-lg transition hover:brightness-90`}
    >
      {children}
    </button>
  );
};


export default Button;
