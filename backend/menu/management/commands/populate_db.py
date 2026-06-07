from decimal import Decimal

from django.core.management.base import BaseCommand

from menu.models import Category, MenuItem, Extra, ExtraOption


CATEGORY_ORDER = {
    "PIZZAS": 1,
    "VEGAN_PIZZAS": 2,
    "NEW_PIZZAS": 3,
    "KEBABI": 4,
    "CHICKEN_KEBAB": 5,
    "SALADS": 6,
    "FALAFEL": 7,
    "VEGAN_FOOD": 8,
    "CHICKEN_FILLETS": 9,
    "BURGER_MEALS": 10,
    "CHICKEN_BURGER_MEALS": 11,
    "STEAKS": 12,
    "NUGGETS": 13,
    "BEVERAGES": 14,
}

MENU_ITEMS = [
    # ── PIZZAS ──────────────────────────────────────────────────────────────
    {"category": "PIZZAS", "name": "1. Bolognese",          "description": "minced meat",                                                             "base_price": "9.50",  "sale_price": "9.02"},
    {"category": "PIZZAS", "name": "2. Tropicana",          "description": "Ham pineapple",                                                           "base_price": "10.00", "sale_price": "9.50"},
    {"category": "PIZZAS", "name": "3. Opera",              "description": "ham, tuna",                                                               "base_price": "10.00", "sale_price": "9.50"},
    {"category": "PIZZAS", "name": "4. Flower pizza",       "description": "4 fillings of your choice, including French fries",                       "base_price": "13.00", "sale_price": "12.35"},
    {"category": "PIZZAS", "name": "5. Americana",          "description": "ham, pineapple, blue cheese",                                             "base_price": "10.50", "sale_price": "9.97"},
    {"category": "PIZZAS", "name": "6. Chicken Hawajii",    "description": "chicken, pineapple, blue cheese",                                         "base_price": "10.50", "sale_price": "9.97"},
    {"category": "PIZZAS", "name": "7. Mexicana",           "description": "jalopeno, pepperoni, Mexican sauce, pineapple, garlic",                   "base_price": "11.00", "sale_price": "10.45"},
    {"category": "PIZZAS", "name": "8. Kebab pizza",        "description": "kebab, onion, jalopeno, tomato, blue cheese",                             "base_price": "11.00", "sale_price": "10.45"},
    {"category": "PIZZAS", "name": "9. The North Star",     "description": "pepperoni, onion, smoked reindeer, porcini mushroom, paprika",             "base_price": "11.50", "sale_price": "10.92"},
    {"category": "PIZZAS", "name": "10. Barbeque pizza",    "description": "chicken, pineapple, bacon, mozzarella, BBQ sauce",                        "base_price": "11.50", "sale_price": "10.92"},
    {"category": "PIZZAS", "name": "11. Sour cream pizza",  "description": "kebab meat, onion, jalopeno, feta, tomato, sour cream, garlic",           "base_price": "13.00", "sale_price": "12.35"},
    {"category": "PIZZAS", "name": "12. Dillinger",         "description": "ham, salami, minced meat, onion",                                         "base_price": "11.00", "sale_price": "10.45"},
    {"category": "PIZZAS", "name": "13. Hermanni Special",  "description": "ham, salami, bacon, egg, sour cream, garlic",                             "base_price": "11.50", "sale_price": "10.92"},
    {"category": "PIZZAS", "name": "14. Papa's Special",    "description": "pepperoni, onion, ollivi, bacon, tomato, house sauce",                    "base_price": "12.00", "sale_price": "11.40"},
    {"category": "PIZZAS", "name": "15. Quattro Stagione",  "description": "ham, mushroom, paprika, shrimp",                                          "base_price": "11.00", "sale_price": "10.45"},
    {"category": "PIZZAS", "name": "16. Opera Special",     "description": "ham, salami, tuna",                                                       "base_price": "10.50", "sale_price": "9.97"},
    {"category": "PIZZAS", "name": "17. Empire",            "description": "ham, salami, onion, tomato, shrimp, garlic",                              "base_price": "11.50", "sale_price": "10.92"},
    {"category": "PIZZAS", "name": "18. Julia",             "description": "ham, pineapple, shrimp, blue cheese",                                     "base_price": "11.00", "sale_price": "10.45"},
    {"category": "PIZZAS", "name": "19. Chef's Special",    "description": "kebab, bacon, salami, ham, pepperoni",                                    "base_price": "13.00", "sale_price": "12.35"},
    {"category": "PIZZAS", "name": "20. House Special",     "description": "kebab, green pepperoni, onion, salami, house sauce",                      "base_price": "11.50", "sale_price": "10.92"},
    {"category": "PIZZAS", "name": "21. InterPizza",        "description": "kebab, onion, jalopeno, tomato, house sauce",                             "base_price": "12.50", "sale_price": "11.87"},
    {"category": "PIZZAS", "name": "22. Lahti Pizza",       "description": "kebab, onion, french fries, salad, house sauce",                          "base_price": "12.50", "sale_price": "11.87"},
    {"category": "PIZZAS", "name": "23. Four cheese pizza", "description": "feta, blue cheese, cheese, mozzarella, arugula, sour cream",              "base_price": "12.50", "sale_price": "11.87"},
    {"category": "PIZZAS", "name": "24. Northern lights",   "description": "smoked reindeer, capers, pepperoni, plow cheese, garlic",                 "base_price": "11.50", "sale_price": "10.92"},
    {"category": "PIZZAS", "name": "25. O'Sole mio",        "description": "pepperoni, blue cheese, tomato, garlic, house sauce",                     "base_price": "11.50", "sale_price": "10.92"},
    {"category": "PIZZAS", "name": "26. Frutti di mare",    "description": "tuna, mussel, shrimp",                                                    "base_price": "11.00", "sale_price": "10.45"},
    {"category": "PIZZAS", "name": "27. Fantasy (1 filling)",  "description": "1 with filling",   "base_price": "9.50",  "sale_price": "9.02"},
    {"category": "PIZZAS", "name": "27. Fantasy (2 fillings)", "description": "With 2 fillings",  "base_price": "10.50", "sale_price": "9.97"},
    {"category": "PIZZAS", "name": "27. Fantasy (3 fillings)", "description": "With 3 fillings",  "base_price": "11.00", "sale_price": "10.45"},
    {"category": "PIZZAS", "name": "27. Fantasy (4 fillings)", "description": "With 4 fillings",  "base_price": "11.50", "sale_price": "10.92"},

    # ── VEGAN PIZZAS ────────────────────────────────────────────────────────
    {"category": "VEGAN_PIZZAS", "name": "V1. Vöner pizza",           "description": "Vöner, onion, green pepperoni, tomato, vegan cheese",                      "base_price": "15.90", "sale_price": "15.10"},
    {"category": "VEGAN_PIZZAS", "name": "V2. To Vegas for life",     "description": "tomato, porcini mushroom, paprika, capers, onion, vegan cheese",           "base_price": "14.90", "sale_price": "14.15"},
    {"category": "VEGAN_PIZZAS", "name": "V3. Green Pizza",           "description": "tomato, paprika, mushroom, ollivi, onion, vegan cheese",                   "base_price": "14.90", "sale_price": "14.15"},
    {"category": "VEGAN_PIZZAS", "name": "V4. Vegan Driver",          "description": "Vöner, jalopeno, pineapple, garlic, vegan cheese",                         "base_price": "15.90", "sale_price": "15.10"},
    {"category": "VEGAN_PIZZAS", "name": "V5. Vegan choice (1 filling)",  "description": "1 with filling",   "base_price": "15.00", "sale_price": "14.25"},
    {"category": "VEGAN_PIZZAS", "name": "V5. Vegan choice (2 fillings)", "description": "With 2 fillings",  "base_price": "15.00", "sale_price": "14.25"},
    {"category": "VEGAN_PIZZAS", "name": "V5. Vegan choice (3 fillings)", "description": "With 3 fillings",  "base_price": "16.00", "sale_price": "15.20"},
    {"category": "VEGAN_PIZZAS", "name": "V5. Vegan choice (4 fillings)", "description": "With 4 fillings",  "base_price": "17.00", "sale_price": "16.15"},

    # ── NEW PIZZAS ───────────────────────────────────────────────────────────
    {"category": "NEW_PIZZAS", "name": "U1. Parma ham",       "description": "mozzarella, tomato, goat cheese, on a warm pizza: parma ham arugula",       "base_price": "16.50", "sale_price": "15.67"},
    {"category": "NEW_PIZZAS", "name": "U2. Smoke reindeer",  "description": "smoked reindeer, blue cheese, porcini mushroom, onion, bacon, parma ham",   "base_price": "16.00", "sale_price": "15.20"},
    {"category": "NEW_PIZZAS", "name": "U3. Vöner Special",   "description": "vöner, jalopeno, tomato, onion, rucola",                                    "base_price": "14.00", "sale_price": "13.30"},
    {"category": "NEW_PIZZAS", "name": "U4. Zucchini",        "description": "zucchini, onion, paprika, goat cheese",                                     "base_price": "14.00", "sale_price": "13.30"},
    {"category": "NEW_PIZZAS", "name": "U5. Eggplant",        "description": "eggplant, goat cheese, tomato, onion, rocket",                              "base_price": "16.00", "sale_price": "15.20"},
    {"category": "NEW_PIZZAS", "name": "U6. Harskan Power",   "description": "smoked reindeer, eggplant, summer squash, goat cheese, parma ham, rucola",  "base_price": "19.00", "sale_price": "18.05"},

    # ── KEBABI ───────────────────────────────────────────────────────────────
    {"category": "KEBABI", "name": "28. Kebab with pitabread",               "description": "", "base_price": "9.50",  "sale_price": "9.02"},
    {"category": "KEBABI", "name": "29. Kebab with French fries",            "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "KEBABI", "name": "30. Kebab with rice",                    "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "KEBABI", "name": "31. Kebab with creamy potatoes",         "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "KEBABI", "name": "32. Kebab with cheese fries",            "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "KEBABI", "name": "33. Kebab with garlic fries",            "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "KEBABI", "name": "34. Kebab with blue cheese potatoes",    "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "KEBABI", "name": "35. Kebab with sliced potatoes",         "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "KEBABI", "name": "36. Kebab with salad",                   "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "KEBABI", "name": "37. Iskender Kebab",                     "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "KEBABI", "name": "38. Kebab roll",                         "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "KEBABI", "name": "39. Blue cheese Kebab roll",             "description": "", "base_price": "11.50", "sale_price": "10.92"},
    {"category": "KEBABI", "name": "40. Cheese kebab roll",                  "description": "", "base_price": "11.50", "sale_price": "10.92"},
    {"category": "KEBABI", "name": "41. Special Kebab (rice, french fries)", "description": "", "base_price": "11.50", "sale_price": "10.92"},

    # ── CHICKEN KEBAB ────────────────────────────────────────────────────────
    {"category": "CHICKEN_KEBAB", "name": "42. Chicken with Pita bread",           "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "CHICKEN_KEBAB", "name": "43. Chicken with French fries",         "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "CHICKEN_KEBAB", "name": "44. Chicken with rice",                 "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "CHICKEN_KEBAB", "name": "45. Chicken with creamed potatoes",     "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "CHICKEN_KEBAB", "name": "46. Chicken with Blue cheese potatoes", "description": "", "base_price": "11.50", "sale_price": "10.92"},
    {"category": "CHICKEN_KEBAB", "name": "47. Chicken with garlic fries",         "description": "", "base_price": "11.50", "sale_price": "10.92"},
    {"category": "CHICKEN_KEBAB", "name": "48. Chicken with cheese potatoes",      "description": "", "base_price": "11.50", "sale_price": "10.92"},
    {"category": "CHICKEN_KEBAB", "name": "49. Chicken with potato wedges",        "description": "", "base_price": "11.50", "sale_price": "10.92"},
    {"category": "CHICKEN_KEBAB", "name": "50. Chicken roll",                      "description": "", "base_price": "11.50", "sale_price": "10.92"},
    {"category": "CHICKEN_KEBAB", "name": "51. Special Chicken Kebab",             "description": "", "base_price": "12.00", "sale_price": "11.40"},

    # ── SALADS ───────────────────────────────────────────────────────────────
    {"category": "SALADS", "name": "52. Tuna salad",    "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "SALADS", "name": "53. Shrimp Salad",  "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "SALADS", "name": "54. Chicken Salad", "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "SALADS", "name": "55. Ham Salad",     "description": "", "base_price": "10.50", "sale_price": "9.97"},

    # ── FALAFEL ──────────────────────────────────────────────────────────────
    {"category": "FALAFEL", "name": "56. Falafel with Pita bread",   "description": "", "base_price": "9.50",  "sale_price": "9.02"},
    {"category": "FALAFEL", "name": "57. Falafel roll",              "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "FALAFEL", "name": "58. Falafel with french fries", "description": "", "base_price": "10.50", "sale_price": "9.97"},
    {"category": "FALAFEL", "name": "59. Falafel with rice",         "description": "", "base_price": "10.50", "sale_price": "9.97"},

    # ── VEGAN FOOD ───────────────────────────────────────────────────────────
    {"category": "VEGAN_FOOD", "name": "60. Vöner pita",               "description": "", "base_price": "13.00", "sale_price": "12.35"},
    {"category": "VEGAN_FOOD", "name": "61. Vöner in the Frenchfries", "description": "", "base_price": "14.50", "sale_price": "13.77"},
    {"category": "VEGAN_FOOD", "name": "62. Vöner Iskender",           "description": "", "base_price": "14.50", "sale_price": "13.77"},
    {"category": "VEGAN_FOOD", "name": "63. Vöner with potato wedges", "description": "", "base_price": "14.50", "sale_price": "13.77"},
    {"category": "VEGAN_FOOD", "name": "64. Vöner with rice",          "description": "", "base_price": "14.50", "sale_price": "13.77"},
    {"category": "VEGAN_FOOD", "name": "65. Vöner roll",               "description": "", "base_price": "14.50", "sale_price": "13.77"},
    {"category": "VEGAN_FOOD", "name": "66. Vöner with salad",         "description": "", "base_price": "14.50", "sale_price": "13.77"},

    # ── CHICKEN FILLETS ──────────────────────────────────────────────────────
    {"category": "CHICKEN_FILLETS", "name": "67. Chicken fillet with rice",     "description": "", "base_price": "11.00", "sale_price": "10.45"},
    {"category": "CHICKEN_FILLETS", "name": "68. Chicken fillet with potatoes", "description": "", "base_price": "11.00", "sale_price": "10.45"},

    # ── BURGER MEALS (includes 0.33l drink + fries) ──────────────────────────
    {"category": "BURGER_MEALS", "name": "69. Megaburger",           "description": "160g steak, cheddar cheese",               "base_price": "12.40", "sale_price": "11.78"},
    {"category": "BURGER_MEALS", "name": "70. Layered cheeseburger", "description": "2x 160g steak, 2x cheddar cheese",         "base_price": "14.50", "sale_price": "13.77"},
    {"category": "BURGER_MEALS", "name": "71. Americano Burger",     "description": "3x 160g steak, 3x cheddar cheese",         "base_price": "17.00", "sale_price": "16.15"},
    {"category": "BURGER_MEALS", "name": "72. BBQ burger",           "description": "160g steak, cheddar cheese",               "base_price": "12.70", "sale_price": "12.06"},
    {"category": "BURGER_MEALS", "name": "73. Maxburger",            "description": "160g steak, cheddar cheese, egg",          "base_price": "12.70", "sale_price": "12.06"},
    {"category": "BURGER_MEALS", "name": "74. Chilli Burger",        "description": "2x 160g steak, 2x cheddar cheese, jalopeno", "base_price": "14.50", "sale_price": "13.77"},

    # ── CHICKEN BURGER MEALS (includes 0.33l drink + fries) ─────────────────
    {"category": "CHICKEN_BURGER_MEALS", "name": "75. Mega Chicken Burger",      "description": "chicken steak, cheddar cheese",           "base_price": "12.40", "sale_price": "11.78"},
    {"category": "CHICKEN_BURGER_MEALS", "name": "76. Layered chicken burger",   "description": "2x chicken steak, 2x cheddar cheese",     "base_price": "14.50", "sale_price": "13.77"},
    {"category": "CHICKEN_BURGER_MEALS", "name": "77. American chicken burger",  "description": "3x chicken steak, 3x cheddar cheese",     "base_price": "16.50", "sale_price": "15.67"},

    # ── STEAKS (200g steak, salad, tomato, pickle, green pepperoni) ──────────
    {"category": "STEAKS", "name": "78. Leaf steak",   "description": "", "base_price": "14.00", "sale_price": "13.30"},
    {"category": "STEAKS", "name": "79. Onion steak",  "description": "", "base_price": "15.00", "sale_price": "14.25"},
    {"category": "STEAKS", "name": "80. Pepper steak", "description": "", "base_price": "16.00", "sale_price": "15.20"},

    # ── NUGGETS ──────────────────────────────────────────────────────────────
    {"category": "NUGGETS", "name": "81. Sausage fries",                   "description": "", "base_price": "9.50",  "sale_price": "9.02"},
    {"category": "NUGGETS", "name": "82. Nuggets (5 pcs) in Frenchfries",  "description": "", "base_price": "7.00",  "sale_price": "6.65"},
    {"category": "NUGGETS", "name": "83. Nuggets (10 pcs) in Frenchfries", "description": "", "base_price": "10.00", "sale_price": "9.50"},
    {"category": "NUGGETS", "name": "84. Nuggets (15 pcs) in Frenchfries", "description": "", "base_price": "13.00", "sale_price": "12.35"},
    {"category": "NUGGETS", "name": "85. Hotwings (10 pcs)",               "description": "", "base_price": "10.00", "sale_price": "9.50"},
    {"category": "NUGGETS", "name": "86. Hotwings (15 pcs)",               "description": "", "base_price": "15.00", "sale_price": "14.25"},
    {"category": "NUGGETS", "name": "87. Hotwings (20 pcs)",               "description": "", "base_price": "20.00", "sale_price": "19.00"},
    {"category": "NUGGETS", "name": "88. Just french fries",               "description": "", "base_price": "5.00",  "sale_price": "4.75"},
    {"category": "NUGGETS", "name": "89. Sweet potato fries",              "description": "", "base_price": "8.00",  "sale_price": "7.60"},

    # ── BEVERAGES ────────────────────────────────────────────────────────────
    {"category": "BEVERAGES", "name": "Fanta",          "description": "", "base_price": "2.50", "sale_price": "2.37"},
    {"category": "BEVERAGES", "name": "1L Milk",        "description": "", "base_price": "2.50", "sale_price": "2.37"},
    {"category": "BEVERAGES", "name": "Coca Cola",      "description": "", "base_price": "2.50", "sale_price": "2.37"},
    {"category": "BEVERAGES", "name": "Coca Cola Zero", "description": "", "base_price": "2.50", "sale_price": "2.37"},
]


class Command(BaseCommand):
    help = "Populate database with Amazona menu data"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Seeding database..."))

        # Clear existing data
        ExtraOption.objects.all().delete()
        Extra.objects.all().delete()
        MenuItem.objects.all().delete()
        Category.objects.all().delete()

        # Create categories
        categories = {}
        for category_name, order in CATEGORY_ORDER.items():
            categories[category_name] = Category.objects.create(
                name=category_name.replace("_", " ").title(),
                slug=category_name.lower(),
                description=f"{category_name.replace('_', ' ').title()} menu",
                order=order,
            )

        # Create menu items
        menu_item_objs = [
            MenuItem(
                category=categories[item["category"]],
                name=item["name"],
                description=item["description"],
                base_price=Decimal(item["base_price"]),
                sale_price=Decimal(item["sale_price"]),
                is_menu_item=True,
            )
            for item in MENU_ITEMS
        ]
        MenuItem.objects.bulk_create(menu_item_objs)

        # ── Pizza extras ─────────────────────────────────────────────────────
        pizza_category = categories["PIZZAS"]

        size_extra = Extra.objects.create(
            category=pizza_category,
            name="Size",
            extra_type="choice",
            is_required=True,
            order=1,
        )
        ExtraOption.objects.bulk_create([
            ExtraOption(extra=size_extra, name="Regular", additional_price=Decimal("0.00")),
            ExtraOption(extra=size_extra, name="Large",   additional_price=Decimal("2.00")),
        ])

        toppings_extra = Extra.objects.create(
            category=pizza_category,
            name="Extra Toppings",
            extra_type="extra",
            is_required=False,
            max_selections=10,
            order=2,
        )
        ExtraOption.objects.bulk_create([
            ExtraOption(extra=toppings_extra, name="Extra Cheese", additional_price=Decimal("1.00")),
            ExtraOption(extra=toppings_extra, name="Pepperoni",    additional_price=Decimal("1.50")),
            ExtraOption(extra=toppings_extra, name="Ham",          additional_price=Decimal("1.50")),
            ExtraOption(extra=toppings_extra, name="Chicken",      additional_price=Decimal("1.50")),
            ExtraOption(extra=toppings_extra, name="Kebab",        additional_price=Decimal("1.50")),
            ExtraOption(extra=toppings_extra, name="Pineapple",    additional_price=Decimal("0.75")),
            ExtraOption(extra=toppings_extra, name="Mushroom",     additional_price=Decimal("0.75")),
            ExtraOption(extra=toppings_extra, name="Onion",        additional_price=Decimal("0.50")),
            ExtraOption(extra=toppings_extra, name="Jalapeno",     additional_price=Decimal("0.75")),
        ])

        self.stdout.write(
            self.style.SUCCESS(
                f"Database seeded successfully ✔ ({len(MENU_ITEMS)} menu items)"
            )
        )