from django.core.management.base import BaseCommand
 
 
class Command(BaseCommand):
    help = 'Seed Ravintola Amazona menu data'
 
    def handle(self, *args, **kwargs):
        from seed_amazona import seed_db
        seed_db()
 