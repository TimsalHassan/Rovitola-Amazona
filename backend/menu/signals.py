# signals.py
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Category, MenuItem, Extra, ExtraOption


# @receiver(post_save, sender=MenuItem)
# @receiver(post_delete, sender=MenuItem)
# def clear_menu_item_cache(sender, instance, **kwargs):
#     # Clear all menu item list variants and the specific detail cache
#     print(f"Cache cleared for MenuItem: {instance.pk}")
#     cache.delete_pattern('menu_items_*')
#     cache.delete(f'menu_item_{instance.pk}')


# @receiver(post_save, sender=Category)
# @receiver(post_delete, sender=Category)
# def clear_category_cache(sender, **kwargs):
#     cache.delete('categories')
#     cache.delete_pattern('menu_items_*')  # category change affects menu lists too


# @receiver(post_save, sender=Extra)
# @receiver(post_delete, sender=Extra)
# def clear_extra_cache(sender, **kwargs):
#     cache.delete_pattern('extras_*')


# @receiver(post_save, sender=ExtraOption)
# @receiver(post_delete, sender=ExtraOption)
# def clear_extra_option_cache(sender, **kwargs):
#     cache.delete_pattern('extra_options_*')






@receiver(post_save, sender=MenuItem)
@receiver(post_delete, sender=MenuItem)
def clear_menu_item_cache(sender, instance, **kwargs):
    print(f"Cache cleared for MenuItem: {instance.pk}")
    cache.delete_pattern('menu_items_*')
    cache.delete(f'menu_item_{instance.pk}')

@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def clear_category_cache(sender, instance, **kwargs):
    cache.delete('categories')
    cache.delete_pattern('menu_items_*')

@receiver(post_save, sender=Extra)
@receiver(post_delete, sender=Extra)
def clear_extra_cache(sender, instance, **kwargs):
    cache.delete_pattern('extras_*')

@receiver(post_save, sender=ExtraOption)
@receiver(post_delete, sender=ExtraOption)
def clear_extra_option_cache(sender, instance, **kwargs):
    cache.delete_pattern('extra_options_*')