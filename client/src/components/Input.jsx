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
    <div className="w-full my-1">
      {label && (
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-wa-text-secondary-light dark:text-wa-text-secondary-dark mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="w-full px-3.5 py-2.5 rounded-xl bg-wa-surface border border-wa-border-light dark:border-wa-border-dark text-sm text-wa-text-primary-light dark:text-wa-text-primary-dark placeholder:text-wa-text-secondary-light dark:placeholder:text-wa-text-secondary-dark outline-none focus:border-wa-teal transition-colors"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default Input;
