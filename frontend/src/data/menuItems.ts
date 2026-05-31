import { MenuItem } from '../types';

const pizzaImages = [
  'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/905847/pexels-photo-905847.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/3944311/pexels-photo-3944311.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2619970/pexels-photo-2619970.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const lunchImages = [
  'https://images.pexels.com/photos/4958776/pexels-photo-4958776.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
];

// Only Pizzat category has items - 12 Finnish pizzas
export const menuItems: MenuItem[] = [
  { id: 'p1', categoryId: 'pizzat', nameFi: 'Margherita', name: 'Margherita', descriptionFi: 'Tomaattikastike, mozzarella, tuore basilika', description: 'Tomato sauce, mozzarella, fresh basil', price: 10.90, image: pizzaImages[0] },
  { id: 'p2', categoryId: 'pizzat', nameFi: 'Quattro Formaggi', name: 'Quattro Formaggi', descriptionFi: 'Neljä juustoa: mozzarella, gorgonzola, parmesaani, cheddar', description: 'Four cheeses: mozzarella, gorgonzola, parmesan, cheddar', price: 14.90, image: pizzaImages[1] },
  { id: 'p3', categoryId: 'pizzat', nameFi: 'Tonno', name: 'Tonno', descriptionFi: 'Tomaattikastike, tonnikala, sipuli, kaprikset, mozzarella', description: 'Tomato sauce, tuna, onion, capers, mozzarella', price: 13.90, image: pizzaImages[2] },
  { id: 'p4', categoryId: 'pizzat', nameFi: 'Pollo', name: 'Pollo', descriptionFi: 'Grillattua kanaa, paprika, sipuli, mozzarella, kermaviili', description: 'Grilled chicken, bell pepper, onion, mozzarella, sour cream', price: 13.50, image: pizzaImages[3] },
  { id: 'p5', categoryId: 'pizzat', nameFi: 'Kebab-pizza', name: 'Kebab Pizza', descriptionFi: 'Tomaattikastike, kebab-liha, sipuli, paprika, mozzarella', description: 'Tomato sauce, kebab meat, onion, pepper, mozzarella', price: 14.50, image: pizzaImages[4] },
  { id: 'p6', categoryId: 'pizzat', nameFi: 'Vegetariana', name: 'Vegetariana', descriptionFi: 'Tuoreet vihannekset: paprika, tomaatti, sienet, oliivit, sipuli', description: 'Fresh vegetables: bell pepper, tomato, mushrooms, olives, onion', price: 12.90, image: pizzaImages[5] },
  { id: 'p7', categoryId: 'pizzat', nameFi: 'Pepperoni', name: 'Pepperoni', descriptionFi: 'Tomaattikastike, mozzarella, pepperoni', description: 'Tomato sauce, mozzarella, pepperoni', price: 12.90, image: pizzaImages[6] },
  { id: 'p8', categoryId: 'pizzat', nameFi: 'Hawaii', name: 'Hawaii', descriptionFi: 'Tomaattikastike, kinkku, ananas, mozzarella', description: 'Tomato sauce, ham, pineapple, mozzarella', price: 11.90, image: pizzaImages[7] },
  { id: 'p9', categoryId: 'pizzat', nameFi: 'Bolognese', name: 'Bolognese', descriptionFi: 'Jauhelihakastike, sipuli, valkosipuli, mozzarella, oregano', description: 'Ground beef sauce, onion, garlic, mozzarella, oregano', price: 13.90, image: pizzaImages[0] },
  { id: 'p10', categoryId: 'pizzat', nameFi: 'Diavola', name: 'Diavola', descriptionFi: 'Tomaattikastike, mozzarella, tulinen salami, chilit', description: 'Tomato sauce, mozzarella, spicy salami, chilies', price: 14.50, image: pizzaImages[1] },
  { id: 'p11', categoryId: 'pizzat', nameFi: 'Funghi', name: 'Funghi', descriptionFi: 'Tomaattikastike, mozzarella, sienet, valkosipuli', description: 'Tomato sauce, mozzarella, mushrooms, garlic', price: 12.50, image: pizzaImages[2] },
  { id: 'p12', categoryId: 'pizzat', nameFi: 'Prosciutto', name: 'Prosciutto', descriptionFi: 'Tomaattikastike, mozzarella, parmankinkku, rucola', description: 'Tomato sauce, mozzarella, prosciutto, arugula', price: 15.90, image: pizzaImages[3] },
];

// Lunch menu items - 6 items
export const lunchItems: MenuItem[] = [
  { id: 'l1', categoryId: 'lunch', nameFi: 'Lounas Kebab', name: 'Lunch Kebab', descriptionFi: 'Kebab-annos ranskalaisilla ja salaatilla', description: 'Kebab plate with fries and salad', price: 8.90, image: lunchImages[0], isLunch: true },
  { id: 'l2', categoryId: 'lunch', nameFi: 'Lounas Pizzat', name: 'Lunch Pizza', descriptionFi: 'Pieni pizza annos juomalla', description: 'Small pizza with a drink', price: 9.50, image: lunchImages[1], isLunch: true },
  { id: 'l3', categoryId: 'lunch', nameFi: 'Lounas Salaatti', name: 'Lunch Salad', descriptionFi: 'Tuore salaatti kana tai kebab-lihalla', description: 'Fresh salad with chicken or kebab', price: 8.50, image: lunchImages[2], isLunch: true },
  { id: 'l4', categoryId: 'lunch', nameFi: 'Lounas Burger', name: 'Lunch Burger', descriptionFi: 'Hampurilainen ranskalaisilla ja juomalla', description: 'Burger with fries and a drink', price: 9.90, image: lunchImages[0], isLunch: true },
  { id: 'l5', categoryId: 'lunch', nameFi: 'Lounas Pasta', name: 'Lunch Pasta', descriptionFi: 'Pasta bolognese tai carbonara', description: 'Pasta bolognese or carbonara', price: 8.90, image: lunchImages[1], isLunch: true },
  { id: 'l6', categoryId: 'lunch', nameFi: 'Lounas Wrappi', name: 'Lunch Wrap', descriptionFi: 'Kebab-rulla ranskalaisilla', description: 'Kebab wrap with fries', price: 8.50, image: lunchImages[2], isLunch: true },
];

// Empty state for other categories
export const emptyCategories = ['vegaanipizzat', 'uutuuspizzat', 'kebabit', 'kanakebabit', 'salaatit', 'falafel', 'vegaaniruoka', 'kanafileet', 'burgerateriat', 'kanaburgerateriat', 'pihvit', 'nugetit', 'juomat'];
