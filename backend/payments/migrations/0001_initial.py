# Generated initial migration for payments app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paytrail_stamp', models.CharField(db_index=True, max_length=200, unique=True)),
                ('paytrail_reference', models.CharField(blank=True, max_length=200)),
                ('paytrail_transaction_id', models.CharField(blank=True, max_length=200, null=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=8)),
                ('currency', models.CharField(default='EUR', max_length=3)),
                ('status', models.CharField(choices=[('initiated', 'Initiated'), ('paid', 'Paid'), ('failed', 'Failed'), ('cancelled', 'Cancelled'), ('refunded', 'Refunded')], default='initiated', max_length=20)),
                ('customer_email', models.EmailField(max_length=254)),
                ('customer_name', models.CharField(max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('order', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='payment', to='orders.order')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='PaymentLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('created', 'Payment Created'), ('callback_received', 'Callback Received'), ('verified', 'Verified'), ('failed', 'Failed'), ('error', 'Error'), ('refund', 'Refund')], max_length=50)),
                ('message', models.TextField()),
                ('response_data', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('payment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='logs', to='payments.payment')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['paytrail_stamp'], name='payments_payment_stamp_idx'),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['status'], name='payments_payment_status_idx'),
        ),
        migrations.AddIndex(
            model_name='payment',
            index=models.Index(fields=['created_at'], name='payments_payment_created_idx'),
        ),
    ]
