from django.core.management.base import BaseCommand
from decimal import Decimal

from menu.models import Category, MenuItem, Extra, ExtraOption


class Command(BaseCommand):
    help = "Populate database with categories, menu items, extras, and options"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Seeding database..."))

        # ─────────────────────────────
        # CLEAR (optional - safe reset)
        # ─────────────────────────────
        ExtraOption.objects.all().delete()
        Extra.objects.all().delete()
        MenuItem.objects.all().delete()
        Category.objects.all().delete()

        # ─────────────────────────────
        # CATEGORIES
        # ─────────────────────────────
        pizza = Category.objects.create(
            name="Pizza",
            slug="pizza",
            description="Fresh oven baked pizzas",
            order=1,
            has_deal=True,
            deal_label="2 Pizzas + Drink = €19.90",
        )

        burger = Category.objects.create(
            name="Burgers",
            slug="burgers",
            description="Juicy grilled burgers",
            order=2,
        )

        drinks = Category.objects.create(
            name="Drinks",
            slug="drinks",
            description="Cold & refreshing beverages",
            order=3,
        )

        desserts = Category.objects.create(
            name="Desserts",
            slug="desserts",
            description="Sweet treats",
            order=4,
        )

        # ─────────────────────────────
        # MENU ITEMS
        # ─────────────────────────────

        margherita = MenuItem.objects.create(
            category=pizza,
            name="Margherita Pizza",
            description="Classic cheese pizza with tomato sauce",
            base_price=Decimal("8.50"),
            sale_price=Decimal("6.99"),
            is_menu_item=True,
        )

        pepperoni = MenuItem.objects.create(
            category=pizza,
            name="Pepperoni Pizza",
            description="Pepperoni, cheese & tomato sauce",
            base_price=Decimal("9.50"),
        )

        cheeseburger = MenuItem.objects.create(
            category=burger,
            name="Cheeseburger",
            description="Beef patty with cheese",
            base_price=Decimal("5.50"),
        )

        cola = MenuItem.objects.create(
            category=drinks,
            name="Coca Cola",
            description="Chilled soft drink",
            base_price=Decimal("1.50"),
        )

        ice_cream = MenuItem.objects.create(
            category=desserts,
            name="Ice Cream",
            description="Vanilla ice cream scoop",
            base_price=Decimal("2.50"),
        )

        # ─────────────────────────────
        # EXTRAS - PIZZA
        # ─────────────────────────────

        size = Extra.objects.create(
            category=pizza,
            name="Size",
            extra_type="choice",
            is_required=True,
            order=1,
        )

        ExtraOption.objects.bulk_create([
            ExtraOption(extra=size, name="Small", additional_price=Decimal("0")),
            ExtraOption(extra=size, name="Medium", additional_price=Decimal("2.00")),
            ExtraOption(extra=size, name="Large", additional_price=Decimal("4.00")),
        ])

        toppings = Extra.objects.create(
            category=pizza,
            name="Toppings",
            extra_type="extra",
            is_required=False,
            max_selections=5,
            order=2,
        )

        ExtraOption.objects.bulk_create([
            ExtraOption(extra=toppings, name="Extra Cheese", additional_price=Decimal("1.00")),
            ExtraOption(extra=toppings, name="Olives", additional_price=Decimal("0.50")),
            ExtraOption(extra=toppings, name="Mushrooms", additional_price=Decimal("0.75")),
            ExtraOption(extra=toppings, name="Chicken", additional_price=Decimal("1.50")),
        ])

        # ─────────────────────────────
        # EXTRAS - BURGER
        # ─────────────────────────────

        burger_size = Extra.objects.create(
            category=burger,
            name="Meal Size",
            extra_type="choice",
            is_required=True,
            order=1,
        )

        ExtraOption.objects.bulk_create([
            ExtraOption(extra=burger_size, name="Regular", additional_price=Decimal("0")),
            ExtraOption(extra=burger_size, name="Large Meal", additional_price=Decimal("2.50")),
        ])

        sauces = Extra.objects.create(
            category=burger,
            name="Sauces",
            extra_type="extra",
            max_selections=3,
            order=2,
        )

        ExtraOption.objects.bulk_create([
            ExtraOption(extra=sauces, name="Ketchup", additional_price=Decimal("0")),
            ExtraOption(extra=sauces, name="BBQ Sauce", additional_price=Decimal("0.30")),
            ExtraOption(extra=sauces, name="Garlic Mayo", additional_price=Decimal("0.50")),
        ])

        self.stdout.write(self.style.SUCCESS("Database seeded successfully ✔"))