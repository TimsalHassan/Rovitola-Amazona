export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameFi: string;
  description: string;
  descriptionFi: string;
  price: number;
  image: string;
  soldOut?: boolean;
  isLunch?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameFi: string;
  icon: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  size: 'small' | 'medium' | 'large';
  toppings: ToppingSelection[];
  seasonings: SeasoningSelection[];
  totalPrice: number;
}

export interface ToppingSelection {
  id: string;
  name: string;
  nameFi: string;
  price: number;
}

export interface SeasoningSelection {
  id: string;
  name: string;
  nameFi: string;
}

export interface Topping {
  id: string;
  name: string;
  nameFi: string;
  price: number;
}

export interface Seasoning {
  id: string;
  name: string;
  nameFi: string;
}

export type Language = 'fi' | 'en';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  orderType: 'delivery' | 'pickup';
  address?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  status: OrderStatus;
  estimatedTime: string;
  createdAt: Date;
  customerId?: string;
  customerPhoneOnly?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: Date;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: 'general' | 'order' | 'feedback' | 'partnership';
  message: string;
}

export const AVAILABLE_TOPPINGS: Topping[] = [
  { id: 'mushrooms', name: 'Mushrooms', nameFi: 'Sienet', price: 0.80 },
  { id: 'olives', name: 'Olives', nameFi: 'Oliivit', price: 0.80 },
  { id: 'jalapenos', name: 'Jalapeños', nameFi: 'Jalapeños', price: 0.80 },
  { id: 'extra-cheese', name: 'Extra Cheese', nameFi: 'Lisäjuusto', price: 1.20 },
  { id: 'pepperoni', name: 'Pepperoni', nameFi: 'Pepperoni', price: 1.50 },
  { id: 'onions', name: 'Onions', nameFi: 'Sipuli', price: 0.50 },
  { id: 'corn', name: 'Corn', nameFi: 'Maissi', price: 0.50 },
  { id: 'pineapple', name: 'Pineapple', nameFi: 'Ananas', price: 0.80 },
];

export const AVAILABLE_SEASONINGS: Seasoning[] = [
  { id: 'oregano', name: 'Oregano', nameFi: 'Oregano' },
  { id: 'chili-flakes', name: 'Chili Flakes', nameFi: 'Chilhiutaleet' },
  { id: 'garlic-powder', name: 'Garlic Powder', nameFi: 'Valkosipulijauhe' },
  { id: 'black-pepper', name: 'Black Pepper', nameFi: 'Mustapippuri' },
];

export const SIZE_PRICES = {
  small: 0,
  medium: 2,
  large: 4,
};
