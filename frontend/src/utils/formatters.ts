import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formater une somme d'argent
 */
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formater une date
 */
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
};

/**
 * Formater une date avec l'heure
 */
export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
};

/**
 * Formater un numéro de compte (masquer partiellement)
 */
export const formatAccountNumber = (accountNumber: string, maskLength: number = 4): string => {
  if (accountNumber.length <= maskLength) return accountNumber;
  
  const visiblePart = accountNumber.slice(-maskLength);
  const maskedPart = '*'.repeat(accountNumber.length - maskLength);
  
  return `${maskedPart}${visiblePart}`;
};

/**
 * Obtenir les initiales d'un nom
 */
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Formater un statut pour l'affichage
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Actif',
    'INACTIVE': 'Inactif',
    'CLOSED': 'Fermé',
    'PENDING': 'En attente',
    'COMPLETED': 'Complété',
    'FAILED': 'Échoué',
    'CANCELLED': 'Annulé',
  };
  
  return statusMap[status] || status;
};