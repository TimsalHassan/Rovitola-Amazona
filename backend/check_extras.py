import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from menu.models import Extra, ExtraOption
import json
from menu.serializers import ExtraSerializer

# Get extras for pizzas category
extras = Extra.objects.filter(category__slug='pizzas').order_by('order')

serializer = ExtraSerializer(extras, many=True, context={'request': type('Request', (), {'query_params': {'language': 'en'}})})
print(json.dumps(serializer.data, indent=2, default=str))
