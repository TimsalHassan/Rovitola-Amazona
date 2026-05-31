import { Order, CartItem, MenuItem } from '../types';

const pizzaImages = [
  'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const mockPizzas: MenuItem[] = [
  { id: 'p1', categoryId: 'pizzat', nameFi: 'Margherita', name: 'Margherita', descriptionFi: '', description: '', price: 10.90, image: pizzaImages[0] },
  { id: 'p5', categoryId: 'pizzat', nameFi: 'Kebab-pizza', name: 'Kebab Pizza', descriptionFi: '', description: '', price: 14.50, image: pizzaImages[0] },
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2847',
    items: [
      { item: mockPizzas[0], quantity: 2, size: 'medium', toppings: [{ id: 'extra-cheese', name: 'Extra Cheese', nameFi: 'Lisäjuusto', price: 1.20 }], seasonings: [{ id: 'oregano', name: 'Oregano', nameFi: 'Oregano' }], totalPrice: 26.20 },
      { item: mockPizzas[1], quantity: 1, size: 'large', toppings: [], seasonings: [], totalPrice: 18.50 },
    ],
    subtotal: 44.70,
    deliveryCharge: 0,
    discount: 2.24,
    total: 42.46,
    orderType: 'delivery',
    address: 'Hämeenkatu 12, 15100 Lahti',
    customerName: 'Matti Meikäläinen',
    customerEmail: 'matti@example.com',
    customerPhone: '+358 40 123 4567',
    status: 'delivered',
    estimatedTime: '30-45 min',
    createdAt: new Date(Date.now() - 86400000 * 3),
    customerId: 'user-1',
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-3156',
    items: [
      { item: mockPizzas[0], quantity: 1, size: 'medium', toppings: [], seasonings: [], totalPrice: 12.90 },
    ],
    subtotal: 12.90,
    deliveryCharge: 4,
    discount: 0.65,
    total: 16.25,
    orderType: 'delivery',
    address: 'Kauppakatu 5, 15100 Lahti',
    customerName: 'Matti Meikäläinen',
    customerEmail: 'matti@example.com',
    customerPhone: '+358 40 123 4567',
    status: 'on_the_way',
    estimatedTime: '30-45 min',
    createdAt: new Date(Date.now() - 3600000 * 2),
    customerId: 'user-1',
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-3321',
    items: [
      { item: mockPizzas[1], quantity: 2, size: 'small', toppings: [{ id: 'jalapenos', name: 'Jalapeños', nameFi: 'Jalapeños', price: 0.80 }], seasonings: [], totalPrice: 32.60 },
    ],
    subtotal: 32.60,
    deliveryCharge: 0,
    discount: 1.63,
    total: 30.97,
    orderType: 'pickup',
    address: undefined,
    customerName: 'Matti Meikäläinen',
    customerEmail: 'matti@example.com',
    customerPhone: '+358 40 123 4567',
    status: 'preparing',
    estimatedTime: '30-45 min',
    createdAt: new Date(Date.now() - 1800000),
    customerId: 'user-1',
  },
];

export function findOrdersByPhone(phone: string): Order[] {
  const normalizedPhone = phone.replace(/\s/g, '').replace('+358', '0').replace(/^00358/, '0');
  return mockOrders.filter(o => {
    const orderPhone = o.customerPhone.replace(/\s/g, '').replace('+358', '0').replace(/^00358/, '0');
    return orderPhone.includes(normalizedPhone) || normalizedPhone.includes(orderPhone);
  });
}

export function getOrdersForCustomer(customerId: string): Order[] {
  return mockOrders.filter(o => o.customerId === customerId);
}
