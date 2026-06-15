from django.db import models
from core.translation import translate_text
from cloudinary.models import CloudinaryField
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, blank=True)
    name_fi = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    description_fi = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    order = models.IntegerField(default=0)
    has_deal = models.BooleanField(default=False)
    deal_label = models.CharField(
        max_length=200, blank=True,
        help_text='e.g. "2 Pizzas + Drink = €19.90"'
    )
    deal_label_fi = models.CharField(max_length=200, blank=True)
    creation_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name or self.name_fi

    def save(self, *args, **kwargs):
        if self.name and not self.name_fi:
            self.name_fi = translate_text(self.name, 'en', 'fi')
        elif self.name_fi and not self.name:
            self.name = translate_text(self.name_fi, 'fi', 'en')
        if self.description and not self.description_fi:
            self.description_fi = translate_text(self.description, 'en', 'fi')
        elif self.description_fi and not self.description:
            self.description = translate_text(self.description_fi, 'fi', 'en')
        if self.deal_label and not self.deal_label_fi:
            self.deal_label_fi = translate_text(self.deal_label, 'en', 'fi')

        # Slug auto-generate karo agar nahi hai
        if not self.slug:
            base_slug = slugify(self.name or self.name_fi or 'category')
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class MenuItem(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=200, blank=True)
    name_fi = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    description_fi = models.TextField(blank=True)

    # ── Pricing ────────-=───────────────────────────────────────
    base_price = models.DecimalField(
        max_digits=6, decimal_places=2, default=0,
        help_text='Regular price'
    )
    sale_price = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text='Sale price. Agar set hai toh base price ki jagah yeh show hoga'
    )

    image = CloudinaryField('Image', folder='menu/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_menu_item = models.BooleanField(default=True)
    is_lunch_item = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return self.name or self.name_fi

    @property
    def current_price(self):
        """Sale ho tou sale_price, warna base_price"""
        return self.sale_price if self.sale_price is not None else self.base_price

    @property
    def is_on_sale(self):
        return self.sale_price is not None

    def save(self, *args, **kwargs):
        if self.name and not self.name_fi:
            self.name_fi = translate_text(self.name, 'en', 'fi')
        elif self.name_fi and not self.name:
            self.name = translate_text(self.name_fi, 'fi', 'en')
        if self.description and not self.description_fi:
            self.description_fi = translate_text(self.description, 'en', 'fi')
        elif self.description_fi and not self.description:
            self.description = translate_text(self.description_fi, 'fi', 'en')
        super().save(*args, **kwargs)


class Extra(models.Model):
    """
    Customization group for a category.
    e.g. 'Size' (single choice), 'Toppings' (multiple)
    Same extras apply to ALL items in the category.
    """
    EXTRA_TYPE_CHOICES = [
        ('choice', 'Single Choice (Size, Sauce, Spice Level)'),
        ('extra',  'Multiple Selection (Toppings, Add-ons)'),
    ]
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="extras"
    )
    name = models.CharField(max_length=100, blank=True)
    name_fi = models.CharField(max_length=100, blank=True)
    extra_type = models.CharField(
        max_length=20, choices=EXTRA_TYPE_CHOICES, default='choice'
    )
    order = models.IntegerField(default=0)
    is_required = models.BooleanField(
        default=False,
        help_text='Customer must select this before adding to cart'
    )
    max_selections = models.IntegerField(
        null=True, blank=True,
        help_text='Max options selectable (for multiple type only). Leave blank for unlimited.'
    )

    class Meta:
        ordering = ["category", "order"]
        unique_together = ("category", "name")
        verbose_name_plural = "Extras"

    def __str__(self):
        return f"{self.category} → {self.name or self.name_fi}"

    def save(self, *args, **kwargs):
        if self.name and not self.name_fi:
            self.name_fi = translate_text(self.name, 'en', 'fi')
        elif self.name_fi and not self.name:
            self.name = translate_text(self.name_fi, 'fi', 'en')
        super().save(*args, **kwargs)


class ExtraOption(models.Model):
    """
    Individual option inside an Extra.
    e.g. Size → Small (+€0), Medium (+€2), Large (+€4)
    """
    extra = models.ForeignKey(
        Extra, on_delete=models.CASCADE, related_name="options"
    )
    name = models.CharField(max_length=100, blank=True)
    name_fi = models.CharField(max_length=100, blank=True)
    additional_price = models.DecimalField(
        max_digits=6, decimal_places=2, default=0,
        help_text='Extra cost on top of item base price'
    )
    sale_price = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
        help_text='Sale price for this option. If set, shown instead of additional_price'
    )
    order = models.IntegerField(default=0)
    is_default = models.BooleanField(
        default=False,
        help_text='This option will be selected by default when adding the extra to the cart'
    )

    class Meta:
        ordering = ["extra", "order"]
        unique_together = ("extra", "name")

    def __str__(self):
        price = f"+€{self.additional_price}" if self.additional_price > 0 else "free"
        return f"{self.name or self.name_fi} ({price})"

    @property
    def display_price(self):
        return self.sale_price if self.sale_price is not None else self.additional_price

    @property
    def is_on_sale(self):
        return self.sale_price is not None
    
    def save(self, *args, **kwargs):
        if self.name and not self.name_fi:
            self.name_fi = translate_text(self.name, 'en', 'fi')
        elif self.name_fi and not self.name:
            self.name = translate_text(self.name_fi, 'fi', 'en')
        super().save(*args, **kwargs)
