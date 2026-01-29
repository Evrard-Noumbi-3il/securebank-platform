/*
 * Email validation
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'L\'email est requis' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }

  return { isValid: true };
};

/*
 * Password validation
 */
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Le mot de passe est requis' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins une majuscule' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins une minuscule' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins un chiffre' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Le mot de passe doit contenir au moins un caractère spécial' };
  }

  return { isValid: true };
};

/*
 * Password confirmation validation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: 'La confirmation du mot de passe est requise' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Les mots de passe ne correspondent pas' };
  }

  return { isValid: true };
};

/*
 * IBAN validation (format français)
 */
export const validateIBAN = (iban: string): { isValid: boolean; error?: string } => {
  if (!iban) {
    return { isValid: false, error: 'L\'IBAN est requis' };
  }

  const cleanedIBAN = iban.replace(/\s/g, '').toUpperCase();

  if (cleanedIBAN.length !== 27) {
    return { isValid: false, error: 'L\'IBAN doit contenir 27 caractères' };
  }

  if (!cleanedIBAN.startsWith('FR')) {
    return { isValid: false, error: 'L\'IBAN doit commencer par FR' };
  }

  const ibanRegex = /^FR[0-9]{2}[A-Z0-9]{23}$/;
  if (!ibanRegex.test(cleanedIBAN)) {
    return { isValid: false, error: 'Format d\'IBAN invalide' };
  }

  return { isValid: true };
};

/* 
 * Account number validation
 */
export const validateAccountNumber = (accountNumber: string): { isValid: boolean; error?: string } => {
  if (!accountNumber) {
    return { isValid: false, error: 'Le numéro de compte est requis' };
  }

  const accountRegex = /^ACC[0-9]{6,}$/;
  
  if (!accountRegex.test(accountNumber)) {
    return { isValid: false, error: 'Format de numéro de compte invalide (ex: ACC123456)' };
  }

  return { isValid: true };
};

/*
 * Amount validation
 */
export const validateAmount = (
  amount: number,
  min: number = 0.01,
  max?: number
): { isValid: boolean; error?: string } => {
  if (amount === null || amount === undefined) {
    return { isValid: false, error: 'Le montant est requis' };
  }

  if (isNaN(amount)) {
    return { isValid: false, error: 'Le montant doit être un nombre valide' };
  }

  if (amount <= 0) {
    return { isValid: false, error: 'Le montant doit être supérieur à 0' };
  }

  if (amount < min) {
    return { isValid: false, error: `Le montant minimum est de ${min}€` };
  }

  if (max && amount > max) {
    return { isValid: false, error: `Le montant maximum est de ${max}€` };
  }

  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Le montant ne peut avoir plus de 2 décimales' };
  }

  return { isValid: true };
};

/* 
 * Balance validation for transfers
 */
export const validateBalance = (
  amount: number,
  balance: number
): { isValid: boolean; error?: string } => {
  if (amount > balance) {
    return { isValid: false, error: 'Solde insuffisant' };
  }

  return { isValid: true };
};

/*
 * Phone number validation (format Francais)
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Le numéro de téléphone est requis' };
  }

  const cleanedPhone = phone.replace(/[\s.-]/g, '');

  const phoneRegex = /^0[1-9][0-9]{8}$/;
  
  if (!phoneRegex.test(cleanedPhone)) {
    return { isValid: false, error: 'Format de téléphone invalide (ex: 0612345678)' };
  }

  return { isValid: true };
};

/*
 * Name validation
 */
export const validateName = (name: string, fieldName: string = 'Nom'): { isValid: boolean; error?: string } => {
  if (!name) {
    return { isValid: false, error: `${fieldName} est requis` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} doit contenir au moins 2 caractères` };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} ne peut dépasser 50 caractères` };
  }

  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes` };
  }

  return { isValid: true };
};

/*
 * Date validation
 */
export const validateDate = (date: string, fieldName: string = 'Date'): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: `${fieldName} est requise` };
  }

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} invalide` };
  }

  return { isValid: true };
};

/*
 * Date range validation
 */
export const validateDateRange = (
  startDate: string,
  endDate: string
): { isValid: boolean; error?: string } => {
  const startValidation = validateDate(startDate, 'Date de début');
  if (!startValidation.isValid) {
    return startValidation;
  }

  const endValidation = validateDate(endDate, 'Date de fin');
  if (!endValidation.isValid) {
    return endValidation;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) {
    return { isValid: false, error: 'La date de début doit être antérieure à la date de fin' };
  }

  return { isValid: true };
};

/* 
 * Description validation
 */
export const validateDescription = (
  description: string,
  minLength: number = 3,
  maxLength: number = 500
): { isValid: boolean; error?: string } => {
  if (!description) {
    return { isValid: false, error: 'La description est requise' };
  }

  if (description.trim().length < minLength) {
    return { isValid: false, error: `La description doit contenir au moins ${minLength} caractères` };
  }

  if (description.trim().length > maxLength) {
    return { isValid: false, error: `La description ne peut dépasser ${maxLength} caractères` };
  }

  return { isValid: true };
};

/*
 * Generic required field validation
 */
export const validateRequired = (value: any, fieldName: string): { isValid: boolean; error?: string } => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} est requis` };
  }

  return { isValid: true };
};

/*
 * Validate all fields at once
 */
export const validateFields = (
  fields: { [key: string]: any },
  validations: { [key: string]: (value: any) => { isValid: boolean; error?: string } }
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  Object.keys(validations).forEach((fieldKey) => {
    const validation = validations[fieldKey](fields[fieldKey]);
    if (!validation.isValid && validation.error) {
      errors[fieldKey] = validation.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateIBAN,
  validateAccountNumber,
  validateAmount,
  validateBalance,
  validatePhoneNumber,
  validateName,
  validateDate,
  validateDateRange,
  validateDescription,
  validateRequired,
  validateFields,
};