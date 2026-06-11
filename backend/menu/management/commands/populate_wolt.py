"""
Management command: populate_from_wolt
=======================================
Wolt se scraped CSV ko database mein load karta hai.

Usage:
    python manage.py populate_from_wolt
    python manage.py populate_from_wolt --csv /path/to/other.csv
    python manage.py populate_from_wolt --no-clear   # existing data delete mat karo

Place this file at:
    backend/menu/management/commands/populate_from_wolt.py

CSV must be next to manage.py or pass --csv flag:
    backend/amazona_menu.csv
"""

import csv
import re
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

from menu.models import Category, MenuItem, Extra, ExtraOption


# ── Category config ────────────────────────────────────────────────────────────
# Finnish name (as it appears in CSV) → slug + display order
# "Most ordered" is intentionally excluded — it's a Wolt UI section, not a real category.

CATEGORY_META = {
    "Pizzat":        {"slug": "pizzat",        "order": 1},
    "Vegaanipizzat": {"slug": "vegaanipizzat", "order": 2},
    "Uutuus Pizzat": {"slug": "uutuus-pizzat", "order": 3},
    "Kebabit":       {"slug": "kebabit",       "order": 4},
    "Kanakebabit":   {"slug": "kanakebabit",   "order": 5},
    "Falafel":       {"slug": "falafel",       "order": 6},
    "Vöner":         {"slug": "voner",         "order": 7},
    "Burger Ateriat":{"slug": "burger-ateriat","order": 8},
    "Snacks":        {"slug": "snacks",        "order": 9},
    "Juomat":        {"slug": "juomat",        "order": 10},
    "Ben & Jerry's": {"slug": "ben-jerrys",    "order": 11},
}

SKIP_CATEGORIES = {"Most ordered"}


# ── Helpers ────────────────────────────────────────────────────────────────────

def parse_price(raw: str) -> Decimal | None:
    """'€13.00' or '€13,00' → Decimal('13.00'). Empty/None → None."""
    if not raw:
        return None
    # Remove € symbol and whitespace, normalise comma → dot
    cleaned = re.sub(r"[€\s]", "", raw).replace(",", ".")
    try:
        return Decimal(cleaned)
    except InvalidOperation:
        return None


def make_slug(name_fi: str, existing_slugs: set) -> str:
    """
    Slugify the Finnish name. If slug already taken, append -2, -3, etc.
    slugify handles ä→a, ö→o etc via unicode normalisation.
    """
    base = slugify(name_fi) or "category"
    slug = base
    counter = 2
    while slug in existing_slugs:
        slug = f"{base}-{counter}"
        counter += 1
    existing_slugs.add(slug)
    return slug


# ── Command ────────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Populate DB from Wolt-scraped CSV (amazona_menu.csv)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=str,
            default=None,
            help="Path to CSV file. Default: <BASE_DIR>/amazona_menu.csv",
        )
        parser.add_argument(
            "--no-clear",
            action="store_true",
            default=False,
            help="Don't delete existing menu data before seeding",
        )

    def handle(self, *args, **options):
        # ── Resolve CSV path ──────────────────────────────────────────────────
        if options["csv"]:
            csv_path = Path(options["csv"])
        else:
            # Assume CSV sits next to manage.py (i.e. backend/)
            csv_path = Path(__file__).resolve().parents[4] / "amazona_menu.csv"

        if not csv_path.exists():
            raise CommandError(
                f"CSV not found: {csv_path}\n"
                "Copy amazona_menu.csv into the backend/ folder, or pass --csv <path>"
            )

        self.stdout.write(f"Reading: {csv_path}")

        # ── Parse CSV ─────────────────────────────────────────────────────────
        rows = []
        with open(csv_path, encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)

        self.stdout.write(f"Total rows in CSV: {len(rows)}")

        # ── Clear existing data ───────────────────────────────────────────────
        if not options["no_clear"]:
            self.stdout.write(self.style.WARNING("Clearing existing menu data..."))
            ExtraOption.objects.all().delete()
            Extra.objects.all().delete()
            MenuItem.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write("  Cleared.")

        # ── Build category → rows mapping ─────────────────────────────────────
        category_rows: dict[str, list[dict]] = {}
        skipped_cats = set()

        for row in rows:
            cat_fi = row["category"].strip()

            if cat_fi in SKIP_CATEGORIES:
                skipped_cats.add(cat_fi)
                continue

            if cat_fi not in CATEGORY_META:
                # Unknown category — warn but still import under auto-generated slug
                if cat_fi not in skipped_cats:
                    self.stdout.write(
                        self.style.WARNING(
                            f"  ⚠ Unknown category '{cat_fi}' — will be imported with auto slug"
                        )
                    )

            category_rows.setdefault(cat_fi, []).append(row)

        self.stdout.write(f"Skipped categories: {skipped_cats or 'none'}")
        self.stdout.write(f"Categories to create: {list(category_rows.keys())}")

        # ── Create categories ─────────────────────────────────────────────────
        existing_slugs: set[str] = set()
        categories: dict[str, Category] = {}

        for cat_fi, _ in sorted(
            category_rows.items(),
            key=lambda kv: CATEGORY_META.get(kv[0], {}).get("order", 99),
        ):
            meta = CATEGORY_META.get(cat_fi, {})
            slug = meta.get("slug") or make_slug(cat_fi, existing_slugs)
            order = meta.get("order", 99)
            existing_slugs.add(slug)

            cat_obj, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "name_fi": cat_fi,
                    # name (English) will be auto-translated by model.save()
                    "order": order,
                },
            )
            if not created:
                # Update order & Finnish name in case of --no-clear re-run
                cat_obj.name_fi = cat_fi
                cat_obj.order = order
                cat_obj.save()

            categories[cat_fi] = cat_obj
            flag = "✔ created" if created else "↺ updated"
            self.stdout.write(f"  [{flag}] Category: {cat_fi} (slug={slug})")

        # ── Create menu items ─────────────────────────────────────────────────
        created_count = 0
        skipped_count = 0

        for cat_fi, item_rows in category_rows.items():
            cat_obj = categories[cat_fi]

            # Track (name_fi) within this category to skip duplicates
            seen_names: set[str] = set()

            for row in item_rows:
                name_fi = row["name"].strip()
                desc_fi = row["description"].strip()

                if not name_fi:
                    continue

                # Skip duplicates within the same category
                if name_fi in seen_names:
                    skipped_count += 1
                    continue
                seen_names.add(name_fi)

                # ── Price logic ───────────────────────────────────────────
                # Wolt shows:
                #   price         = current selling price  → base_price
                #   original_price= crossed-out old price  → this is the HIGHER original
                #
                # In your MenuItem model:
                #   base_price  = regular price
                #   sale_price  = discounted price (shown instead of base when set)
                #
                # So if Wolt shows both: item is on sale.
                #   base_price  = original_price (higher, crossed out)
                #   sale_price  = price (lower, what customer pays)
                # If Wolt shows only price: not on sale.
                #   base_price  = price
                #   sale_price  = None

                current_price = parse_price(row.get("price", ""))
                original_price = parse_price(row.get("original_price", ""))

                if current_price is None:
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠ No price for '{name_fi}' — skipping")
                    )
                    skipped_count += 1
                    continue

                if original_price and original_price > current_price:
                    # Item is discounted on Wolt
                    base_price = original_price
                    sale_price = current_price
                else:
                    base_price = current_price
                    sale_price = None

                # ── Create or update ──────────────────────────────────────
                item_obj, created = MenuItem.objects.get_or_create(
                    category=cat_obj,
                    name_fi=name_fi,
                    defaults={
                        "description_fi": desc_fi,
                        "base_price": base_price,
                        "sale_price": sale_price,
                        "is_available": True,
                        "is_menu_item": True,
                    },
                )
                if not created:
                    # --no-clear mode: update prices & description
                    item_obj.description_fi = desc_fi
                    item_obj.base_price = base_price
                    item_obj.sale_price = sale_price
                    item_obj.save()

                created_count += 1

        # ── Pizza extras (Size + Toppings) ────────────────────────────────────
        # Only add if they don't already exist
        pizza_cat = categories.get("Pizzat")
        if pizza_cat:
            size_extra, created = Extra.objects.get_or_create(
                category=pizza_cat,
                name="Size",
                defaults={
                    "extra_type": "choice",
                    "is_required": True,
                    "order": 1,
                },
            )
            if created:
                ExtraOption.objects.bulk_create([
                    ExtraOption(extra=size_extra, name="Regular", additional_price=Decimal("0.00"), order=1),
                    ExtraOption(extra=size_extra, name="Large",   additional_price=Decimal("2.00"), order=2),
                ])
                self.stdout.write("  ✔ Pizza Size extra created")

            toppings_extra, created = Extra.objects.get_or_create(
                category=pizza_cat,
                name="Extra Toppings",
                defaults={
                    "extra_type": "extra",
                    "is_required": False,
                    "max_selections": 10,
                    "order": 2,
                },
            )
            if created:
                ExtraOption.objects.bulk_create([
                    ExtraOption(extra=toppings_extra, name="Extra Cheese", additional_price=Decimal("1.00"),  order=1),
                    ExtraOption(extra=toppings_extra, name="Pepperoni",    additional_price=Decimal("1.50"),  order=2),
                    ExtraOption(extra=toppings_extra, name="Ham",          additional_price=Decimal("1.50"),  order=3),
                    ExtraOption(extra=toppings_extra, name="Chicken",      additional_price=Decimal("1.50"),  order=4),
                    ExtraOption(extra=toppings_extra, name="Kebab",        additional_price=Decimal("1.50"),  order=5),
                    ExtraOption(extra=toppings_extra, name="Pineapple",    additional_price=Decimal("0.75"),  order=6),
                    ExtraOption(extra=toppings_extra, name="Mushroom",     additional_price=Decimal("0.75"),  order=7),
                    ExtraOption(extra=toppings_extra, name="Onion",        additional_price=Decimal("0.50"),  order=8),
                    ExtraOption(extra=toppings_extra, name="Jalapeno",     additional_price=Decimal("0.75"),  order=9),
                ])
                self.stdout.write("  ✔ Pizza Toppings extra created")

        # ── Summary ───────────────────────────────────────────────────────────
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(self.style.SUCCESS(
            f"✔ Done!  {created_count} items imported,  {skipped_count} skipped"
        ))
        self.stdout.write(self.style.SUCCESS(
            f"   Categories: {Category.objects.count()}"
        ))
        self.stdout.write(self.style.SUCCESS(
            f"   Menu items: {MenuItem.objects.count()}"
        ))
        self.stdout.write(self.style.SUCCESS("=" * 50))
        self.stdout.write(
            self.style.WARNING(
                "\nNOTE: 'name' (English) fields are auto-translated by model.save().\n"
                "If deep-translator is configured, translations will run automatically.\n"
                "Check Category.name and MenuItem.name in Django admin after running."
            )
        )
