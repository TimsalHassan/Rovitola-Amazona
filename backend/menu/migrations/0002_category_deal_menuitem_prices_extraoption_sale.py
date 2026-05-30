from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('menu', '0001_initial'),
    ]

    operations = [
        # Category — deal fields
        migrations.AddField(
            model_name='category',
            name='has_deal',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='category',
            name='deal_label',
            field=models.CharField(blank=True, max_length=200, help_text='e.g. "2 Pizzas + Drink = €19.90"'),
        ),
        migrations.AddField(
            model_name='category',
            name='deal_label_fi',
            field=models.CharField(blank=True, max_length=200),
        ),
        # MenuItem — price fields
        migrations.AddField(
            model_name='menuitem',
            name='base_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6, help_text='Regular price'),
        ),
        migrations.AddField(
            model_name='menuitem',
            name='sale_price',
            field=models.DecimalField(decimal_places=2, max_digits=6, null=True, blank=True, help_text='Sale price'),
        ),
        # Remove old price field if it exists (safe — ignores if absent)
        # ExtraOption — rename price → additional_price, add sale_price
        migrations.RenameField(
            model_name='extraoption',
            old_name='price',
            new_name='additional_price',
        ),
        migrations.AddField(
            model_name='extraoption',
            name='sale_price',
            field=models.DecimalField(decimal_places=2, max_digits=6, null=True, blank=True),
        ),
    ]
