export interface NormalizedTicket {
  id: number;
  type: string;
  status: string;
  createdAt: Date | string;
  firstName: string;
  lastName: string;
}

export const TICKET_TYPES = [
  'Реєстрація авто',
  'Перереєстрація авто',
  'Зняття з обліку',
  'Отримання номерів',
  'Видача дубліката техпаспорта',
  'Заміна водійського посвідчення',
  'Отримання довідки про технічний стан',
  'Заміна номерних знаків',
];

export const STATUS_MAP = {
  completed: 'Виконано',
  rejected: 'Відхилено',
  pending: 'В обробці',
} as const;
