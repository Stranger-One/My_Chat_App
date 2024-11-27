import React from "react";

const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  label,
  ...props
}) => {
  return (
    <div className="w-full bg-secondary my-0">
      {label && (
        <label htmlFor={name} className="whitespace-nowrap font-medium text-text">
          {label}:
        </label>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className=" w-full outline-none placeholder:text-text/70 text-text rounded-lg px-2 py-2 bg-background "
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default Input;
