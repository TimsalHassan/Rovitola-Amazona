from rest_framework.throttling import SimpleRateThrottle

class LoginRateThrottle(SimpleRateThrottle):
    scope = 'login'

    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }

class RegisterRateThrottle(SimpleRateThrottle):
    scope = 'register'
    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope, 
            'ident': self.get_ident(request)
        }

class ChangePasswordRateThrottle(SimpleRateThrottle):
    scope = 'change_password'
    def get_cache_key(self, request, view):
        return self.cache_format % {'scope': self.scope, 'ident': self.get_ident(request)}