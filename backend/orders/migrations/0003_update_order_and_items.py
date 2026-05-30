from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Make customer nullable on Order
        migrations.AlterField(
            model_name='order',
            name='customer',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='orders',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # Add guest fields to Order
        migrations.AddField(
            model_name='order',
            name='guest_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='order',
            name='guest_phone',
            field=models.CharField(blank=True, max_length=20),
        ),
        # OrderItem — rename unit_price → base_price, remove size field
        migrations.RenameField(
            model_name='orderitem',
            old_name='unit_price',
            new_name='base_price',
        ),
        # Add special_instruction if not already there
        migrations.AddField(
            model_name='orderitem',
            name='special_instruction',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        # Create OrderItemSelectedOption
        migrations.CreateModel(
            name='OrderItemSelectedOption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('extra_name', models.CharField(max_length=100)),
                ('extra_name_fi', models.CharField(blank=True, max_length=100)),
                ('option_name', models.CharField(max_length=100)),
                ('option_name_fi', models.CharField(blank=True, max_length=100)),
                ('additional_price', models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ('order_item', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='selected_options',
                    to='orders.orderitem',
                )),
            ],
        ),
    ]
