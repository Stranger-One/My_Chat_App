import React from "react";

const Button = ({
  children,
  className = "",
  onClick,
  type = "button",
  bg = "bg-wa-teal",
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`${bg} ${className} px-4 py-2.5 font-semibold text-white rounded-xl transition-all shadow-sm hover:brightness-95 active:scale-[0.99] flex items-center justify-center`}
    >
      {children}
    </button>
  );
};

export default Button;
