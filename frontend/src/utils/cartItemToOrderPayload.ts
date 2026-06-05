import { CartItem } from "../context/CartContext";

export function cartItemToOrderPayload(item: CartItem) {
  return {
    menu_item_name: item.menuItem.name || item.menuItem.name_fi,
    menu_item_name_fi: item.menuItem.name_fi,
    quantity: item.quantity,
    base_price: Number(item.menuItem.current_price),
    total_price: item.totalPrice,
    special_instruction: item.specialInstruction,
    selected_options: item.selectedOptions.map((opt) => ({
      extra_name: opt.extra_name,
      extra_name_fi: opt.extra_name_fi,
      option_name: opt.option_name,
      option_name_fi: opt.option_name_fi,
      additional_price: opt.additional_price,
    })),
  };
}