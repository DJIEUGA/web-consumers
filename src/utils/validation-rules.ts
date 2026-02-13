/**
 * Validation rules and utilities
 */

/**
 * Regular expressions
 */
export const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const phoneRegex =
  /^(\+\d{1,3})?\d{8,15}$/;

/**
 * Field types supported by the validator
 */
export type FieldType = 'email' | 'password' | 'text' | 'phone';

/**
 * Validation rule definition
 */
export interface ValidationRule {
  required?: boolean;
  type?: FieldType;
  minLength?: number;
  maxLength?: number;
}

/**
 * Validation schema
 */
export type ValidationSchema<T extends Record<string, unknown>> = {
  [K in keyof T]?: ValidationRule;
};

/**
 * Validation errors
 */
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Validate email
 */
export const validateEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

/**
 * Validate password
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): boolean => {
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Generic form validation utility
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): ValidationErrors<T> => {
  const errors: ValidationErrors<T> = {};

  Object.keys(schema).forEach((field) => {
    const rule = schema[field as keyof T];
    const value = data[field as keyof T];

    if (!rule) return;

    if (rule.required && !value) {
      errors[field as keyof T] = `${String(field)} is required`;
      return;
    }

    if (typeof value !== 'string') return;

    if (rule.type === 'email' && !validateEmail(value)) {
      errors[field as keyof T] = 'Invalid email';
    }

    if (rule.type === 'password' && !validatePassword(value)) {
      errors[field as keyof T] = 'Password must be strong';
    }

    if (rule.type === 'phone' && !validatePhone(value)) {
      errors[field as keyof T] = 'Invalid phone number';
    }

    if (rule.minLength && value.length < rule.minLength) {
      errors[field as keyof T] = `Minimum ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field as keyof T] = `Maximum ${rule.maxLength} characters`;
    }
  });

  return errors;
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateForm,
};
