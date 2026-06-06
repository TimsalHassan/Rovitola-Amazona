"""
Ravintola Amazona - Full Menu Seed Data
Restaurant: Ravintola Amazona, Aleksanterinkatu 3, 15110 Lahti, Finland
Website: https://ravintolaamazona.fi/

Run:
    python seed_amazona.py

Requires:
    pip install django  (or just use the DATA dict directly in your Django seed command)

If using Django, call seed_db() inside a management command or shell:
    from seed_amazona import seed_db
    seed_db()
"""

from decimal import Decimal

# ──────────────────────────────────────────────────────────────────────────────
# RAW DATA  (categories → items)
# Each item: name_fi, name_en, description_en, price (€), is_vegan, is_available
# ──────────────────────────────────────────────────────────────────────────────

MENU_DATA = {
    # ── 1. PIZZAS ─────────────────────────────────────────────────────────────
    "PIZZAS": {
        "name_fi": "PIZZAT",
        "name_en": "PIZZAS",
        "description": "Hand-stretched dough, house tomato sauce, mozzarella. All pizzas available in 30 cm.",
        "sort_order": 1,
        "items": [
            {
                "name_fi": "Margherita",
                "name_en": "Margherita",
                "description_en": "Tomato sauce, mozzarella, fresh basil.",
                "price": Decimal("10.90"),
                "is_vegan": False,
                "image_prompt": "top-down flat lay of a classic Margherita pizza with fresh basil leaves and melted mozzarella on tomato sauce, rustic wooden table, warm studio lighting",
            },
            {
                "name_fi": "Pepperoni",
                "name_en": "Pepperoni",
                "description_en": "Tomato sauce, mozzarella, spicy pepperoni slices.",
                "price": Decimal("12.90"),
                "is_vegan": False,
                "image_prompt": "top-down view of a pepperoni pizza loaded with red pepperoni slices and bubbling mozzarella, dark slate background, professional food photography",
            },
            {
                "name_fi": "Quattro Formaggi",
                "name_en": "Four Cheese",
                "description_en": "Tomato sauce, mozzarella, blue cheese, cheddar, parmesan.",
                "price": Decimal("13.90"),
                "is_vegan": False,
                "image_prompt": "close-up of a four cheese pizza with golden bubbly cheese blend, rustic pizza peel, warm candlelight ambiance",
            },
            {
                "name_fi": "Hawaii",
                "name_en": "Hawaii",
                "description_en": "Tomato sauce, mozzarella, ham, pineapple.",
                "price": Decimal("12.90"),
                "is_vegan": False,
                "image_prompt": "overhead shot of a Hawaiian pizza with ham and pineapple chunks, bright natural light, clean white marble surface",
            },
            {
                "name_fi": "Kebabpizza",
                "name_en": "Kebab Pizza",
                "description_en": "Tomato sauce, mozzarella, döner kebab meat, onion, peppers, garlic sauce drizzle.",
                "price": Decimal("13.90"),
                "is_vegan": False,
                "image_prompt": "top-down photo of a kebab pizza topped with shaved döner meat, diced onions, peppers, and garlic sauce drizzle, restaurant style plating",
            },
            {
                "name_fi": "Tonnikala",
                "name_en": "Tuna",
                "description_en": "Tomato sauce, mozzarella, tuna, red onion, capers.",
                "price": Decimal("12.90"),
                "is_vegan": False,
                "image_prompt": "professional food photo of a tuna pizza with flaked tuna, red onion rings and capers on melted mozzarella, overhead angle",
            },
            {
                "name_fi": "Bolognese",
                "name_en": "Bolognese",
                "description_en": "Tomato sauce, mozzarella, seasoned ground beef, herbs.",
                "price": Decimal("13.50"),
                "is_vegan": False,
                "image_prompt": "top-down food photo of bolognese pizza with rich meat sauce, herbs and melted cheese, rustic Italian kitchen feel",
            },
            {
                "name_fi": "Diablo",
                "name_en": "Diablo",
                "description_en": "Spicy tomato sauce, mozzarella, jalapeños, hot salami, chilli flakes.",
                "price": Decimal("13.90"),
                "is_vegan": False,
                "image_prompt": "fiery looking Diablo pizza with jalapeños, hot salami, and chilli flakes on a dark dramatic background, restaurant photography",
            },
            {
                "name_fi": "Prosciutto",
                "name_en": "Prosciutto",
                "description_en": "Tomato sauce, mozzarella, prosciutto crudo, rocket, parmesan shavings.",
                "price": Decimal("14.50"),
                "is_vegan": False,
                "image_prompt": "elegant prosciutto pizza topped with thin prosciutto crudo slices and fresh rocket leaves, white marble background, fine dining style",
            },
            {
                "name_fi": "Amazona Special",
                "name_en": "Amazona Special",
                "description_en": "Tomato sauce, mozzarella, kebab meat, chicken, peppers, mushrooms, house sauce.",
                "price": Decimal("15.90"),
                "is_vegan": False,
                "image_prompt": "loaded Amazona special pizza with mixed kebab, chicken, colorful peppers and mushrooms, overhead restaurant photo",
            },
        ],
    },

    # ── 2. VEGAN PIZZAS ───────────────────────────────────────────────────────
    "VEGAN_PIZZAS": {
        "name_fi": "VEGAANIPIZZAT",
        "name_en": "VEGAN PIZZAS",
        "description": "100 % plant-based toppings. Vegan cheese available on request.",
        "sort_order": 2,
        "items": [
            {
                "name_fi": "Vegaani Margherita",
                "name_en": "Vegan Margherita",
                "description_en": "Tomato sauce, vegan mozzarella, fresh basil, olive oil.",
                "price": Decimal("12.90"),
                "is_vegan": True,
                "image_prompt": "vegan Margherita pizza with plant-based cheese and fresh basil, bright natural light, minimalist food photography",
            },
            {
                "name_fi": "Vegaani Vihannes",
                "name_en": "Vegan Vegetable",
                "description_en": "Tomato sauce, vegan cheese, roasted bell peppers, zucchini, red onion, olives, cherry tomatoes.",
                "price": Decimal("13.90"),
                "is_vegan": True,
                "image_prompt": "colorful vegan vegetable pizza with roasted peppers, zucchini and olives, overhead flat lay, vibrant colors",
            },
            {
                "name_fi": "Vegaani Sieni",
                "name_en": "Vegan Mushroom",
                "description_en": "Tomato sauce, vegan cheese, mixed mushrooms, garlic, thyme, truffle oil.",
                "price": Decimal("13.90"),
                "is_vegan": True,
                "image_prompt": "earthy vegan mushroom pizza with mixed wild mushrooms, thyme garnish, dark moody food photography",
            },
            {
                "name_fi": "Vegaani Falafel",
                "name_en": "Vegan Falafel",
                "description_en": "Hummus base, vegan cheese, falafel balls, diced tomato, cucumber, tahini drizzle.",
                "price": Decimal("14.50"),
                "is_vegan": True,
                "image_prompt": "creative vegan falafel pizza with hummus base, falafel balls and tahini drizzle, Middle-Eastern inspired food photography",
            },
        ],
    },

    # ── 3. NEW PIZZAS ─────────────────────────────────────────────────────────
    "NEW_PIZZAS": {
        "name_fi": "UUTUUSPIZZAT",
        "name_en": "NEW PIZZAS",
        "description": "Chef's new creations — limited time specials.",
        "sort_order": 3,
        "items": [
            {
                "name_fi": "BBQ Pulled Pork",
                "name_en": "BBQ Pulled Pork",
                "description_en": "BBQ sauce base, mozzarella, slow-cooked pulled pork, caramelised onions, pickled jalapeños.",
                "price": Decimal("15.90"),
                "is_vegan": False,
                "image_prompt": "BBQ pulled pork pizza with smoky meat, caramelised onions and BBQ sauce glaze, dramatic side lighting, restaurant food photo",
            },
            {
                "name_fi": "Truffle Chicken",
                "name_en": "Truffle Chicken",
                "description_en": "Cream base, mozzarella, grilled chicken strips, mushrooms, truffle oil, parsley.",
                "price": Decimal("16.50"),
                "is_vegan": False,
                "image_prompt": "luxurious truffle chicken pizza with cream sauce, grilled chicken, mushrooms and truffle oil drizzle, fine dining plating",
            },
            {
                "name_fi": "Mango Chilli Katkarapu",
                "name_en": "Mango Chilli Prawn",
                "description_en": "Mango sauce base, mozzarella, tiger prawns, chilli, coriander, lime zest.",
                "price": Decimal("17.90"),
                "is_vegan": False,
                "image_prompt": "exotic mango chilli prawn pizza with tiger prawns, fresh coriander and lime, vibrant tropical food photography",
            },
            {
                "name_fi": "Korean BBQ",
                "name_en": "Korean BBQ",
                "description_en": "Gochujang sauce, mozzarella, bulgogi beef, spring onions, sesame seeds, kimchi.",
                "price": Decimal("16.90"),
                "is_vegan": False,
                "image_prompt": "Korean BBQ fusion pizza with bulgogi beef, kimchi, spring onions and sesame seeds, Asian fusion restaurant styling",
            },
        ],
    },

    # ── 4. KEBAB ──────────────────────────────────────────────────────────────
    "KEBABI": {
        "name_fi": "KEBABIT",
        "name_en": "KEBABI",
        "description": "Authentic döner kebab with house-made garlic sauce and fresh vegetables.",
        "sort_order": 4,
        "items": [
            {
                "name_fi": "Kebab Lautanen",
                "name_en": "Kebab Plate",
                "description_en": "Döner kebab meat, chips, salad, tomato, cucumber, garlic sauce. Served with pita.",
                "price": Decimal("13.90"),
                "is_vegan": False,
                "image_prompt": "generous kebab plate with shaved döner meat, golden fries, fresh salad and garlic sauce, overhead restaurant photo",
            },
            {
                "name_fi": "Kebab Pitaleipä",
                "name_en": "Kebab Pita",
                "description_en": "Warm pita bread filled with döner meat, lettuce, tomato, onion, garlic sauce.",
                "price": Decimal("10.90"),
                "is_vegan": False,
                "image_prompt": "close-up of a stuffed kebab pita wrap with döner meat and fresh vegetables, street food style photography",
            },
            {
                "name_fi": "Kebab Box",
                "name_en": "Kebab Box",
                "description_en": "Rice, döner kebab, grilled vegetables, salad, choice of sauce.",
                "price": Decimal("14.90"),
                "is_vegan": False,
                "image_prompt": "kebab rice box with fluffy basmati rice, shaved döner meat, grilled vegetables in a take-out box, clean food photography",
            },
            {
                "name_fi": "Kebab Annos Ranskalaisilla",
                "name_en": "Kebab with Fries",
                "description_en": "Double portion of döner meat, crispy fries, coleslaw, garlic sauce.",
                "price": Decimal("14.90"),
                "is_vegan": False,
                "image_prompt": "hearty kebab and fries meal with golden crispy fries and döner meat, sauce on the side, diner style photo",
            },
            {
                "name_fi": "Lasten Kebab",
                "name_en": "Kids Kebab",
                "description_en": "Small döner portion, small fries, ketchup.",
                "price": Decimal("8.90"),
                "is_vegan": False,
                "image_prompt": "child-sized kebab meal with small fries and ketchup dip, cheerful bright background, family restaurant style",
            },
        ],
    },

    # ── 5. CHICKEN KEBAB ──────────────────────────────────────────────────────
    "CHICKEN_KEBAB": {
        "name_fi": "KANAKEBABIT",
        "name_en": "CHICKEN KEBAB",
        "description": "Marinated grilled chicken, house spices.",
        "sort_order": 5,
        "items": [
            {
                "name_fi": "Kana Kebab Lautanen",
                "name_en": "Chicken Kebab Plate",
                "description_en": "Grilled chicken kebab, chips, salad, garlic sauce.",
                "price": Decimal("13.90"),
                "is_vegan": False,
                "image_prompt": "grilled chicken kebab plate with golden fries, crisp salad and creamy garlic sauce, overhead food photography",
            },
            {
                "name_fi": "Kana Kebab Pitaleipä",
                "name_en": "Chicken Kebab Pita",
                "description_en": "Warm pita, grilled chicken, lettuce, tomato, onion, tzatziki.",
                "price": Decimal("10.90"),
                "is_vegan": False,
                "image_prompt": "chicken kebab pita wrap stuffed with grilled chicken, fresh vegetables and tzatziki sauce, appetizing street food photo",
            },
            {
                "name_fi": "Kana Kebab Box",
                "name_en": "Chicken Kebab Box",
                "description_en": "Basmati rice, grilled chicken, roasted peppers, salad, chilli sauce.",
                "price": Decimal("14.90"),
                "is_vegan": False,
                "image_prompt": "chicken kebab box with saffron basmati rice, grilled chicken pieces, roasted peppers in a bowl, vibrant food styling",
            },
            {
                "name_fi": "Kana Kebab & Ranskalaiset",
                "name_en": "Chicken Kebab & Fries",
                "description_en": "Grilled chicken kebab, crispy fries, garlic aioli.",
                "price": Decimal("13.50"),
                "is_vegan": False,
                "image_prompt": "chicken kebab with crispy fries and garlic aioli dip, casual restaurant table setting, warm lighting",
            },
        ],
    },

    # ── 6. SALADS ─────────────────────────────────────────────────────────────
    "SALADS": {
        "name_fi": "SALAATIT",
        "name_en": "SALADS",
        "description": "Fresh, house-prepared salads.",
        "sort_order": 6,
        "items": [
            {
                "name_fi": "Kreikkalainen Salaatti",
                "name_en": "Greek Salad",
                "description_en": "Tomato, cucumber, olives, red onion, feta cheese, oregano, olive oil.",
                "price": Decimal("10.90"),
                "is_vegan": False,
                "image_prompt": "classic Greek salad with chunky tomatoes, cucumbers, olives, feta cheese and oregano, bright Mediterranean styling",
            },
            {
                "name_fi": "Kebab Salaatti",
                "name_en": "Kebab Salad",
                "description_en": "Mixed greens, döner kebab meat, tomato, cucumber, red onion, garlic dressing.",
                "price": Decimal("12.90"),
                "is_vegan": False,
                "image_prompt": "hearty kebab salad bowl with döner meat on fresh greens, tomatoes, onions and creamy garlic dressing drizzle",
            },
            {
                "name_fi": "Kana Salaatti",
                "name_en": "Chicken Salad",
                "description_en": "Grilled chicken breast, romaine lettuce, croutons, parmesan, Caesar dressing.",
                "price": Decimal("12.90"),
                "is_vegan": False,
                "image_prompt": "Caesar chicken salad with grilled chicken strips, romaine lettuce, croutons and parmesan shavings, restaurant quality photo",
            },
            {
                "name_fi": "Falafel Salaatti",
                "name_en": "Falafel Salad",
                "description_en": "Mixed greens, crispy falafel, roasted peppers, cherry tomatoes, tahini dressing.",
                "price": Decimal("11.90"),
                "is_vegan": True,
                "image_prompt": "vegan falafel salad bowl with crispy falafel balls, colorful vegetables and tahini drizzle, bright healthy food photography",
            },
        ],
    },

    # ── 7. FALAFEL ────────────────────────────────────────────────────────────
    "FALAFEL": {
        "name_fi": "FALAFEL",
        "name_en": "FALAFEL",
        "description": "House-made crispy falafel from chickpeas and herbs.",
        "sort_order": 7,
        "items": [
            {
                "name_fi": "Falafel Lautanen",
                "name_en": "Falafel Plate",
                "description_en": "6 falafel balls, hummus, pita, salad, tahini sauce, pickles.",
                "price": Decimal("12.90"),
                "is_vegan": True,
                "image_prompt": "falafel plate with golden crispy falafel balls, creamy hummus, warm pita, pickles and tahini, Middle-Eastern food styling",
            },
            {
                "name_fi": "Falafel Pitaleipä",
                "name_en": "Falafel Pita",
                "description_en": "Warm pita, 4 falafel, lettuce, tomato, tahini, chilli sauce.",
                "price": Decimal("9.90"),
                "is_vegan": True,
                "image_prompt": "stuffed falafel pita bread wrap with crispy falafel, fresh veggies and tahini sauce oozing out, street food photography",
            },
            {
                "name_fi": "Falafel Box",
                "name_en": "Falafel Box",
                "description_en": "Rice, 5 falafel, roasted vegetables, hummus, harissa.",
                "price": Decimal("13.90"),
                "is_vegan": True,
                "image_prompt": "vegan falafel rice box with basmati rice, falafel, roasted vegetables and harissa, colorful plant-based bowl photography",
            },
            {
                "name_fi": "Falafel Ranskalaisilla",
                "name_en": "Falafel with Fries",
                "description_en": "Crispy falafel, seasoned fries, garlic sauce, hot sauce.",
                "price": Decimal("11.90"),
                "is_vegan": True,
                "image_prompt": "falafel and fries combo with golden fries, crispy falafel balls and two dipping sauces, casual food photography",
            },
        ],
    },

    # ── 8. VEGAN FOOD ─────────────────────────────────────────────────────────
    "VEGAN_FOOD": {
        "name_fi": "VEGAANI RUOKA",
        "name_en": "VEGAN FOOD",
        "description": "Completely plant-based dishes.",
        "sort_order": 8,
        "items": [
            {
                "name_fi": "Vegaani Kebab Lautanen",
                "name_en": "Vegan Kebab Plate",
                "description_en": "Plant-based döner, fries, salad, vegan garlic sauce.",
                "price": Decimal("13.90"),
                "is_vegan": True,
                "image_prompt": "vegan kebab plate with plant-based döner meat, golden fries and fresh salad, modern plant-based food styling",
            },
            {
                "name_fi": "Vegaani Buddha Bowl",
                "name_en": "Vegan Buddha Bowl",
                "description_en": "Quinoa, roasted chickpeas, avocado, edamame, shredded carrot, tahini dressing.",
                "price": Decimal("13.90"),
                "is_vegan": True,
                "image_prompt": "colorful vegan buddha bowl with quinoa, avocado, chickpeas, edamame and tahini, healthy food blogger photography",
            },
            {
                "name_fi": "Vegaani Wrap",
                "name_en": "Vegan Wrap",
                "description_en": "Flour tortilla, plant-based meat, lettuce, tomato, red onion, vegan mayo.",
                "price": Decimal("10.90"),
                "is_vegan": True,
                "image_prompt": "vegan wrap cut in half revealing plant-based fillings, fresh vegetables and vegan mayo, overhead food photography",
            },
            {
                "name_fi": "Paahdettuja Vihanneksia",
                "name_en": "Roasted Vegetables",
                "description_en": "Seasonal roasted vegetables, couscous, chimichurri sauce.",
                "price": Decimal("11.90"),
                "is_vegan": True,
                "image_prompt": "roasted seasonal vegetable plate with couscous and chimichurri sauce drizzle, rustic plating on dark background",
            },
        ],
    },

    # ── 9. CHICKEN FILLETS ────────────────────────────────────────────────────
    "CHICKEN_FILLETS": {
        "name_fi": "KANAFILEET",
        "name_en": "CHICKEN FILLETS",
        "description": "Grilled or fried chicken breast fillets.",
        "sort_order": 9,
        "items": [
            {
                "name_fi": "Grillattu Kanafile",
                "name_en": "Grilled Chicken Fillet",
                "description_en": "Grilled chicken breast, fries, salad, garlic sauce.",
                "price": Decimal("13.90"),
                "is_vegan": False,
                "image_prompt": "grilled chicken breast fillet with perfect grill marks, served with fries and garlic sauce, professional restaurant food photo",
            },
            {
                "name_fi": "Paistettu Kanafile",
                "name_en": "Fried Chicken Fillet",
                "description_en": "Crispy fried chicken breast, fries, coleslaw, BBQ sauce.",
                "price": Decimal("13.90"),
                "is_vegan": False,
                "image_prompt": "golden crispy fried chicken fillet with crunchy coating, fries and coleslaw, American diner style food photography",
            },
            {
                "name_fi": "Kana Parmigiana",
                "name_en": "Chicken Parmigiana",
                "description_en": "Breaded chicken, tomato sauce, melted mozzarella, served with pasta.",
                "price": Decimal("16.90"),
                "is_vegan": False,
                "image_prompt": "chicken parmigiana with tomato sauce and bubbling mozzarella cheese on top, Italian restaurant plating",
            },
            {
                "name_fi": "Kana Teriyaki",
                "name_en": "Chicken Teriyaki",
                "description_en": "Grilled chicken in teriyaki glaze, steamed rice, broccoli, sesame.",
                "price": Decimal("15.90"),
                "is_vegan": False,
                "image_prompt": "chicken teriyaki with glossy teriyaki glaze, steamed rice and broccoli, Japanese restaurant plating style",
            },
            {
                "name_fi": "Peri-Peri Kana",
                "name_en": "Peri-Peri Chicken",
                "description_en": "Spicy peri-peri marinated chicken, fries, sour cream dip.",
                "price": Decimal("14.90"),
                "is_vegan": False,
                "image_prompt": "spicy peri-peri grilled chicken with charred edges, golden fries and sour cream, vibrant food photography",
            },
        ],
    },

    # ── 10. BURGER MEALS ──────────────────────────────────────────────────────
    "BURGER_MEALS": {
        "name_fi": "BURGER ATERIAT",
        "name_en": "BURGER MEALS",
        "description": "All burgers served with fries and a soft drink.",
        "sort_order": 10,
        "items": [
            {
                "name_fi": "Classic Burger Ateria",
                "name_en": "Classic Burger Meal",
                "description_en": "Beef patty, lettuce, tomato, pickles, onion, mustard, ketchup, brioche bun. With fries + drink.",
                "price": Decimal("14.90"),
                "is_vegan": False,
                "image_prompt": "classic beef burger with lettuce, tomato and pickles in brioche bun, fries on the side, diner style food photography",
            },
            {
                "name_fi": "Juustoburgeri Ateria",
                "name_en": "Cheeseburger Meal",
                "description_en": "Double beef patty, cheddar, caramelised onion, pickles, burger sauce. With fries + drink.",
                "price": Decimal("15.90"),
                "is_vegan": False,
                "image_prompt": "double cheeseburger with melted cheddar, caramelised onions and burger sauce, golden fries beside it, dramatic side lighting",
            },
            {
                "name_fi": "BBQ Bacon Burgeri Ateria",
                "name_en": "BBQ Bacon Burger Meal",
                "description_en": "Beef patty, crispy bacon, BBQ sauce, onion rings, jalapeños, cheddar. With fries + drink.",
                "price": Decimal("16.90"),
                "is_vegan": False,
                "image_prompt": "towering BBQ bacon burger with crispy bacon, onion rings, jalapeños and BBQ sauce drizzle, smoky food photography",
            },
            {
                "name_fi": "Amazona Signature Burgeri",
                "name_en": "Amazona Signature Burger",
                "description_en": "Double beef, double cheddar, house Amazona sauce, crispy fried onions, gherkins. With fries + drink.",
                "price": Decimal("17.90"),
                "is_vegan": False,
                "image_prompt": "premium signature double burger stacked high with cheese, crispy onions and special sauce, luxury food photography with moody lighting",
            },
        ],
    },

    # ── 11. CHICKEN BURGER MEALS ──────────────────────────────────────────────
    "CHICKEN_BURGER_MEALS": {
        "name_fi": "KANABURGERATERIAT",
        "name_en": "CHICKEN BURGER MEALS",
        "description": "Crispy or grilled chicken burgers served with fries and a soft drink.",
        "sort_order": 11,
        "items": [
            {
                "name_fi": "Crispy Kana Burgeri Ateria",
                "name_en": "Crispy Chicken Burger Meal",
                "description_en": "Crispy fried chicken fillet, lettuce, pickles, mayo, brioche bun. With fries + drink.",
                "price": Decimal("14.90"),
                "is_vegan": False,
                "image_prompt": "crispy fried chicken burger in a toasted brioche bun with pickles and mayo, golden fries, bright fast-food style photo",
            },
            {
                "name_fi": "Grilli Kana Burgeri Ateria",
                "name_en": "Grilled Chicken Burger Meal",
                "description_en": "Grilled chicken breast, avocado, lettuce, tomato, chipotle mayo. With fries + drink.",
                "price": Decimal("15.90"),
                "is_vegan": False,
                "image_prompt": "grilled chicken burger with avocado slices, fresh tomato, lettuce and chipotle mayo, health-conscious food photography",
            },
            {
                "name_fi": "Spicy Kana Burgeri Ateria",
                "name_en": "Spicy Chicken Burger Meal",
                "description_en": "Spicy fried chicken, jalapeños, sriracha mayo, coleslaw, brioche bun. With fries + drink.",
                "price": Decimal("15.90"),
                "is_vegan": False,
                "image_prompt": "spicy chicken burger with fiery jalapeños, dripping sriracha mayo and coleslaw, bold red-toned food photography",
            },
        ],
    },

    # ── 12. STEAKS ────────────────────────────────────────────────────────────
    "STEAKS": {
        "name_fi": "PIHVIT",
        "name_en": "STEAKS",
        "description": "Grilled to order. Choice of sauce: peppercorn, mushroom, or garlic butter.",
        "sort_order": 12,
        "items": [
            {
                "name_fi": "Ribeye Pihvi 200g",
                "name_en": "Ribeye Steak 200g",
                "description_en": "200g ribeye, grilled to preference, fries, salad, peppercorn sauce.",
                "price": Decimal("24.90"),
                "is_vegan": False,
                "image_prompt": "sizzling ribeye steak 200g with perfect grill marks, crispy fries and peppercorn sauce, dark fine dining background",
            },
            {
                "name_fi": "Sirloin Pihvi 250g",
                "name_en": "Sirloin Steak 250g",
                "description_en": "250g sirloin, grilled to preference, roasted potatoes, salad, mushroom sauce.",
                "price": Decimal("26.90"),
                "is_vegan": False,
                "image_prompt": "thick sirloin steak 250g with roasted potatoes and mushroom sauce, elegant steakhouse plating with dark moody lighting",
            },
            {
                "name_fi": "Kana Pihvi",
                "name_en": "Chicken Steak",
                "description_en": "Marinated chicken breast steak, herb roasted potatoes, grilled vegetables, garlic butter.",
                "price": Decimal("17.90"),
                "is_vegan": False,
                "image_prompt": "juicy chicken breast steak with herb roasted potatoes, grilled vegetables and garlic butter melting on top, restaurant quality",
            },
            {
                "name_fi": "Maustettu Lammas Pihvi",
                "name_en": "Spiced Lamb Steak",
                "description_en": "Spiced lamb steak, couscous, roasted peppers, mint yoghurt.",
                "price": Decimal("22.90"),
                "is_vegan": False,
                "image_prompt": "spiced lamb steak with couscous, roasted peppers and mint yoghurt, Middle-Eastern inspired fine dining photo",
            },
        ],
    },

    # ── 13. NUGGETS ───────────────────────────────────────────────────────────
    "NUGGETS": {
        "name_fi": "NUGETIT",
        "name_en": "NUGGETS",
        "description": "Crispy chicken nuggets, choice of dipping sauce.",
        "sort_order": 13,
        "items": [
            {
                "name_fi": "6 Kpl Nugetit",
                "name_en": "6 Nuggets",
                "description_en": "6 crispy chicken nuggets, choice of dipping sauce (ketchup, BBQ, garlic, sweet chilli).",
                "price": Decimal("6.90"),
                "is_vegan": False,
                "image_prompt": "6 golden crispy chicken nuggets with dipping sauces, bright fast-food style photography on white background",
            },
            {
                "name_fi": "9 Kpl Nugetit",
                "name_en": "9 Nuggets",
                "description_en": "9 crispy chicken nuggets, choice of dipping sauce.",
                "price": Decimal("9.90"),
                "is_vegan": False,
                "image_prompt": "9 golden crispy chicken nuggets arranged neatly with multiple dipping sauce cups, appetizing food photo",
            },
            {
                "name_fi": "12 Kpl Nugetit",
                "name_en": "12 Nuggets",
                "description_en": "12 crispy chicken nuggets, choice of dipping sauce.",
                "price": Decimal("12.90"),
                "is_vegan": False,
                "image_prompt": "12 crispy chicken nuggets in a basket with assorted dipping sauces, sharing plate food photography",
            },
            {
                "name_fi": "Nugetit + Ranskalaiset",
                "name_en": "Nuggets + Fries",
                "description_en": "9 nuggets, crispy fries, ketchup, garlic sauce.",
                "price": Decimal("11.90"),
                "is_vegan": False,
                "image_prompt": "nuggets and fries combo in a fast-food tray with ketchup and garlic dip, classic American fast food photography",
            },
            {
                "name_fi": "Lasten Nugetit Ateria",
                "name_en": "Kids Nuggets Meal",
                "description_en": "6 nuggets, small fries, ketchup, apple juice.",
                "price": Decimal("8.90"),
                "is_vegan": False,
                "image_prompt": "kids meal with 6 chicken nuggets, small fries and apple juice box, cheerful bright colors family restaurant photo",
            },
        ],
    },

    # ── 14. BEVERAGES ─────────────────────────────────────────────────────────
    "BEVERAGES": {
        "name_fi": "JUOMAT",
        "name_en": "BEVERAGES",
        "description": "Cold drinks, water, and juices.",
        "sort_order": 14,
        "items": [
            {
                "name_fi": "Coca-Cola 0.33L",
                "name_en": "Coca-Cola 0.33L",
                "description_en": "Ice-cold Coca-Cola can 0.33L.",
                "price": Decimal("2.50"),
                "is_vegan": True,
                "image_prompt": "ice cold Coca-Cola can with condensation droplets on dark background, beverage product photography",
            },
            {
                "name_fi": "Coca-Cola Zero 0.33L",
                "name_en": "Coca-Cola Zero 0.33L",
                "description_en": "Ice-cold Coca-Cola Zero can 0.33L.",
                "price": Decimal("2.50"),
                "is_vegan": True,
                "image_prompt": "Coca-Cola Zero can with water droplets, clean product shot on black background",
            },
            {
                "name_fi": "Fanta Orange 0.33L",
                "name_en": "Fanta Orange 0.33L",
                "description_en": "Fanta Orange can 0.33L.",
                "price": Decimal("2.50"),
                "is_vegan": True,
                "image_prompt": "Fanta Orange can with orange slices and ice, vibrant orange color product photography",
            },
            {
                "name_fi": "Sprite 0.33L",
                "name_en": "Sprite 0.33L",
                "description_en": "Sprite lemon-lime can 0.33L.",
                "price": Decimal("2.50"),
                "is_vegan": True,
                "image_prompt": "Sprite can with lime slices and ice cubes, fresh green toned product photography",
            },
            {
                "name_fi": "Kivennäisvesi 0.5L",
                "name_en": "Sparkling Water 0.5L",
                "description_en": "Sparkling mineral water bottle 0.5L.",
                "price": Decimal("2.00"),
                "is_vegan": True,
                "image_prompt": "sparkling mineral water bottle with bubbles rising, clean minimalist product photography on white",
            },
            {
                "name_fi": "Appelsiinimehu 0.3L",
                "name_en": "Orange Juice 0.3L",
                "description_en": "Fresh orange juice glass 0.3L.",
                "price": Decimal("2.90"),
                "is_vegan": True,
                "image_prompt": "fresh squeezed orange juice in a glass with orange slices, bright sunny food photography",
            },
            {
                "name_fi": "Energiajuoma",
                "name_en": "Energy Drink",
                "description_en": "Energy drink can 0.33L.",
                "price": Decimal("3.00"),
                "is_vegan": True,
                "image_prompt": "energy drink can with neon glow effect, dark moody beverage photography",
            },
            {
                "name_fi": "Lassi (mango/tavallinen)",
                "name_en": "Lassi (mango/plain)",
                "description_en": "Chilled yoghurt-based drink. Choice of mango or plain.",
                "price": Decimal("3.50"),
                "is_vegan": False,
                "image_prompt": "mango lassi in a tall glass with mango chunks and mint garnish, vibrant yellow color, Indian restaurant styling",
            },
        ],
    },
}


# ──────────────────────────────────────────────────────────────────────────────
# RESTAURANT INFO
# ──────────────────────────────────────────────────────────────────────────────

RESTAURANT_INFO = {
    "name": "Ravintola Amazona",
    "address": "Aleksanterinkatu 3, 15110 Lahti, Finland",
    "phone": "+358 037333366",
    "phone_2": "+358 40 809 9885",
    "email": "info@ravintolaamazona.fi",
    "website": "https://ravintolaamazona.fi/",
    "currency": "EUR",
    "min_order": Decimal("13.00"),
    "delivery_fee_local": Decimal("0.00"),   # under 9 km
    "delivery_fee_extended": Decimal("4.00"), # 9–14 km
    "delivery_radius_km": 14,
    "discount_percent": 5,
    "opening_hours": {
        "monday":    {"open": "15:00", "close": "03:00"},
        "tuesday":   {"open": "15:00", "close": "03:00"},
        "wednesday": {"open": "11:00", "close": "03:45"},
        "thursday":  {"open": "11:00", "close": "03:45"},
        "friday":    {"open": "11:00", "close": "03:45"},
        "saturday":  {"open": "11:00", "close": "03:45"},
        "sunday":    {"open": "11:00", "close": "03:45"},
    },
    "lunch_hours": {
        "monday":    {"open": "10:30", "close": "14:30"},
        "tuesday":   {"open": "10:30", "close": "14:30"},
        "wednesday": {"open": "10:30", "close": "14:30"},
        "thursday":  {"open": "10:30", "close": "14:30"},
        "friday":    {"open": "10:30", "close": "14:30"},
        "saturday":  None,
        "sunday":    None,
    },
}


# ──────────────────────────────────────────────────────────────────────────────
# DJANGO ORM SEED  (adapt model names to match your project)
# ──────────────────────────────────────────────────────────────────────────────

def seed_db():
    """
    Seed the database using Django ORM.

    Expected models (adjust imports to your app name):
        Restaurant, MenuCategory, MenuItem

    Fields assumed:
        Restaurant : name, address, phone, phone_2, email, website, currency,
                     min_order, delivery_fee_local, delivery_fee_extended,
                     delivery_radius_km, discount_percent
        MenuCategory: restaurant (FK), name_fi, name_en, description, sort_order
        MenuItem    : category (FK), name_fi, name_en, description_en, price,
                      is_vegan, is_available, image_prompt
    """

    # ── change 'menu.models' to your actual app.models ──
    from menu.models import Restaurant, MenuCategory, MenuItem

    print("🌱  Seeding Ravintola Amazona …")

    # 1. Restaurant
    restaurant, created = Restaurant.objects.get_or_create(
        name=RESTAURANT_INFO["name"],
        defaults={
            "address":               RESTAURANT_INFO["address"],
            "phone":                 RESTAURANT_INFO["phone"],
            "phone_2":               RESTAURANT_INFO["phone_2"],
            "email":                 RESTAURANT_INFO["email"],
            "website":               RESTAURANT_INFO["website"],
            "currency":              RESTAURANT_INFO["currency"],
            "min_order":             RESTAURANT_INFO["min_order"],
            "delivery_fee_local":    RESTAURANT_INFO["delivery_fee_local"],
            "delivery_fee_extended": RESTAURANT_INFO["delivery_fee_extended"],
            "delivery_radius_km":    RESTAURANT_INFO["delivery_radius_km"],
            "discount_percent":      RESTAURANT_INFO["discount_percent"],
        },
    )
    print(f"  {'Created' if created else 'Found'} restaurant: {restaurant.name}")

    total_items = 0

    # 2. Categories + Items
    for slug, cat_data in MENU_DATA.items():
        category, cat_created = MenuCategory.objects.get_or_create(
            restaurant=restaurant,
            name_en=cat_data["name_en"],
            defaults={
                "name_fi":    cat_data["name_fi"],
                "description": cat_data["description"],
                "sort_order": cat_data["sort_order"],
            },
        )
        print(f"  {'Created' if cat_created else 'Found'} category: {category.name_en}")

        for item_data in cat_data["items"]:
            item, item_created = MenuItem.objects.get_or_create(
                category=category,
                name_en=item_data["name_en"],
                defaults={
                    "name_fi":       item_data["name_fi"],
                    "description_en": item_data["description_en"],
                    "price":         item_data["price"],
                    "is_vegan":      item_data["is_vegan"],
                    "is_available":  True,
                    "image_prompt":  item_data["image_prompt"],
                },
            )
            if item_created:
                total_items += 1

    print(f"\n✅  Done! {total_items} new menu items added across {len(MENU_DATA)} categories.")


# ──────────────────────────────────────────────────────────────────────────────
# STANDALONE  — print a summary table (no Django needed)
# ──────────────────────────────────────────────────────────────────────────────

def print_summary():
    print(f"\n{'═'*70}")
    print(f"  RAVINTOLA AMAZONA — MENU SUMMARY")
    print(f"{'═'*70}")
    total = 0
    for slug, cat in MENU_DATA.items():
        count = len(cat["items"])
        total += count
        print(f"  {cat['name_en']:<30} {count:>3} items")
    print(f"{'─'*70}")
    print(f"  {'TOTAL':<30} {total:>3} items")
    print(f"{'═'*70}\n")


if __name__ == "__main__":
    print_summary()
    print("To seed your Django database, call seed_db() from a management command or shell.")
    print("Example:\n  python manage.py shell -c \"from seed_amazona import seed_db; seed_db()\"")
