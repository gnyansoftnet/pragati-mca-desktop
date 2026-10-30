import React, { useState } from 'react';
import Select from 'react-select';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

// Enhanced base class with read-only & disabled styling
const baseInputClass =
  'w-full pl-5 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-200 disabled:bg-slate-100 disabled:cursor-not-allowed read-only:bg-slate-50 read-only:text-slate-600 read-only:border-slate-200 read-only:focus:border-slate-200 read-only:focus:ring-0 read-only:cursor-default';

export default function CustomForm(props) {
  return (
    <form onSubmit={props.onSubmit} className={props.className || 'space-y-4'} {...props}>
      {props.children}
    </form>
  );
}

/* ==========================================================================
   1. Custom Text Field
   ========================================================================== */
CustomForm.CustomTextField = function CustomTextField({
  name,
  value,
  onChange,
  placeholder = 'Enter text...',
  readOnly = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      className={`${baseInputClass} ${className}`}
      {...props}
    />
  );
};

/* ==========================================================================
   2. Custom Number Field
   ========================================================================== */
CustomForm.CustomNumberField = function CustomNumberField({
  name,
  value,
  onChange,
  placeholder = '0.00',
  unit,
  readOnly = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className="relative w-full flex items-center">
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`${baseInputClass} ${unit ? 'pr-12' : ''} ${className}`}
        {...props}
      />
      {unit && (
        <span className="absolute right-3 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md pointer-events-none select-none">
          {unit}
        </span>
      )}
    </div>
  );
};

/* ==========================================================================
   3. Custom Email Field
   ========================================================================== */
CustomForm.CustomEmailField = function CustomEmailField({
  name = 'email',
  value,
  onChange,
  placeholder = 'name@example.com',
  readOnly = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <input
      type="email"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      className={`${baseInputClass} ${className}`}
      {...props}
    />
  );
};

/* ==========================================================================
   4. Custom Password Field (with Show/Hide Toggle)
   ========================================================================== */
CustomForm.CustomPasswordField = function CustomPasswordField({
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  readOnly = false,
  disabled = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full flex items-center">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`${baseInputClass} pr-11 ${className}`}
        {...props}
      />
      {!readOnly && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer select-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff strokeWidth={2} className="w-4 h-4" />
          ) : (
            <Eye strokeWidth={2} className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

/* ==========================================================================
   5. Custom Date Field
   ========================================================================== */
CustomForm.CustomDateField = function CustomDateField({
  name,
  value,
  onChange,
  readOnly = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <input
      type="date"
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      disabled={disabled}
      className={`${baseInputClass} ${className}`}
      {...props}
    />
  );
};

/* ==========================================================================
   6. Custom Address (Textarea)
   ========================================================================== */
CustomForm.CustomAddress = function CustomAddress({
  name = 'address',
  value,
  onChange,
  placeholder = 'Enter address, village, or landmark...',
  rows = 3,
  readOnly = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      className={`${baseInputClass} py-2.5 resize-none ${className}`}
      {...props}
    />
  );
};

/* ==========================================================================
   7. Custom Select Field (HTML Native with readOnly support)
   ========================================================================== */
CustomForm.CustomSelectField = function CustomSelectField({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  readOnly = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <div className="relative w-full flex items-center">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || readOnly}
        className={`${baseInputClass} pr-10 appearance-none ${
          readOnly ? 'cursor-default pointer-events-none' : 'cursor-pointer'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {!readOnly && (
        <div className="absolute right-3.5 text-slate-400 pointer-events-none">
          <ChevronDown strokeWidth={2} className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   8. Custom Select Search Field (react-select with readOnly & safe Array)
   ========================================================================== */
CustomForm.CustomSelectSearchField = function CustomSelectSearchField({
  options = [],
  value,
  onChange,
  name,
  placeholder = 'Search & select...',
  readOnly = false,
  disabled = false,
  className = '',
  ...props
}) {
  // Safe Array validation
  const safeOptions = Array.isArray(options)
    ? options
    : typeof options === 'object' && options !== null
    ? Object.entries(options).map(([val, lbl]) => ({ value: val, label: String(lbl) }))
    : [];

  const selectedValue =
    safeOptions.find((opt) => String(opt.value) === String(value)) || null;

  return (
    <Select
      options={safeOptions}
      value={selectedValue}
      onChange={(selectedOption) => {
        if (!readOnly && typeof onChange === 'function') {
          onChange({
            target: {
              name: name,
              value: selectedOption?.value ?? '',
            },
          });
        }
      }}
      placeholder={placeholder}
      isSearchable={!readOnly}
      isDisabled={disabled || readOnly}
      classNamePrefix="react-select"
      className={`w-full ${className}`}
      styles={{
        container: (base) => ({
          ...base,
          width: '100%',
        }),
        control: (base, state) => ({
          ...base,
          minHeight: '38px',
          height: '38px',
          borderRadius: '0.75rem',
          backgroundColor: readOnly ? '#f8fafc' : '#ffffff',
          borderColor: state.isFocused && !readOnly ? '#10257B' : '#e2e8f0',
          boxShadow: state.isFocused && !readOnly ? '0 0 0 2px rgba(16, 37, 123, 0.15)' : 'none',
          paddingLeft: '0.5rem',
          fontSize: '0.875rem',
          cursor: readOnly ? 'default' : 'pointer',
          '&:hover': {
            borderColor: readOnly ? '#e2e8f0' : state.isFocused ? '#10257B' : '#cbd5e1',
          },
        }),
        valueContainer: (base) => ({
          ...base,
          padding: '0 4px',
        }),
        placeholder: (base) => ({
          ...base,
          color: '#94a3b8',
          fontSize: '0.875rem',
        }),
        singleValue: (base) => ({
          ...base,
          color: readOnly ? '#475569' : '#1e293b',
          fontSize: '0.875rem',
          fontWeight: '500',
        }),
        indicatorsContainer: (base) => ({
          ...base,
          display: readOnly ? 'none' : 'flex',
          paddingRight: '6px',
        }),
        dropdownIndicator: (base, state) => ({
          ...base,
          color: state.isFocused ? '#10257B' : '#94a3b8',
          padding: '4px',
          '&:hover': {
            color: '#10257B',
          },
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f5f9',
          zIndex: 50,
        }),
        option: (base, state) => ({
          ...base,
          fontSize: '0.875rem',
          cursor: 'pointer',
          backgroundColor: state.isSelected
            ? '#10257B'
            : state.isFocused
            ? '#f1f5f9'
            : '#ffffff',
          color: state.isSelected ? '#ffffff' : '#1e293b',
          '&:active': {
            backgroundColor: '#10257B',
            color: '#ffffff',
          },
        }),
      }}
      {...props}
    />
  );
};