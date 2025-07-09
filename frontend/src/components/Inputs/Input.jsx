import { useState, useId } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { HiExclamationCircle, HiCheckCircle } from "react-icons/hi";

const Input = ({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
  error = "",
  success = false,
  required = false,
  disabled = false,
  helperText = "",
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputId = useId();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (type === "password") {
      return showPassword ? "text" : "password";
    }
    return type;
  };

  const getStateClasses = () => {
    if (error) {
      return "border-red-300 bg-red-50 focus-within:border-red-400 focus-within:ring-red-100";
    }
    if (success) {
      return "border-green-300 bg-green-50 focus-within:border-green-400 focus-within:ring-green-100";
    }
    if (isFocused) {
      return "border-orange-300 ring-2 ring-orange-100";
    }
    return "border-gray-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100";
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative w-full flex items-center gap-3 text-sm text-black bg-gray-50/50 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 border outline-none transition-all duration-200 ${getStateClasses()}`}
      >
        <input
          id={inputId}
          type={getInputType()}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-gray-500 disabled:text-gray-400"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />

        {/* Right side icons */}
        <div className="flex items-center gap-2">
          {/* Success/Error indicators */}
          {success && !error && (
            <HiCheckCircle className="h-5 w-5 text-green-500" />
          )}
          {error && <HiExclamationCircle className="h-5 w-5 text-red-500" />}

          {/* Password toggle */}
          {type === "password" && (
            <button
              type="button"
              onClick={toggleShowPassword}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <FaRegEye className="h-5 w-5" />
              ) : (
                <FaRegEyeSlash className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Helper text or error message */}
      {error && (
        <p id={`${inputId}-error`} className="text-red-600 text-xs mt-1">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-gray-500 text-xs mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
