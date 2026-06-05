# signals.py
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Category, MenuItem, Extra, ExtraOption


def safe_cache_clear(patterns=None, keys=None):
    """
    Clear cache by patterns and/or exact keys.
    delete_pattern() only works with django-redis (production).
    In development (LocMemCache), falls back to cache.clear().
    """
    # Try exact key deletions first
    if keys:
        for key in keys:
            cache.delete(key)

    # Try pattern-based deletion (Redis only)
    if patterns:
        try:
            for pattern in patterns:
                cache.delete_pattern(pattern)
        except (AttributeError, NotImplementedError):
            # LocMemCache doesn't support delete_pattern
            # Clear entire cache as fallback (safe for dev)
            cache.clear()


@receiver(post_save, sender=MenuItem)
@receiver(post_delete, sender=MenuItem)
def clear_menu_item_cache(sender, instance, **kwargs):
    safe_cache_clear(
        patterns=['menu_items_*', f'menu:item:{instance.pk}:*'],
    )


@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def clear_category_cache(sender, instance, **kwargs):
    safe_cache_clear(
        patterns=['categories_*', 'menu_items_*'],
    )


@receiver(post_save, sender=Extra)
@receiver(post_delete, sender=Extra)
def clear_extra_cache(sender, instance, **kwargs):
    safe_cache_clear(
        patterns=['extras_*', 'menu_items_*'],
    )


@receiver(post_save, sender=ExtraOption)
@receiver(post_delete, sender=ExtraOption)
def clear_extra_option_cache(sender, instance, **kwargs):
    safe_cache_clear(
        patterns=['extra_options_*', 'extras_*'],
    )