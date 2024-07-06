
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-#9_owqwd8a0#os0qqav)+hnlh^rltb1i0cd&#t@=i6$5@+p)g6'

DEBUG = True #TODO CHANGE TO FALSE IN PROD

ALLOWED_HOSTS = ['*'] ##TODO CHANGE TO INSTANCE IP e DOMAIN.COM.BR


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'crispy_forms',
    'crispy_bootstrap5',
    'bootstrap5',
    'bootstrapform',
    'main.apps.MainConfig',
    'rest_framework',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ORIGIN_WHITELIST = [
    'http://localhost:3000',  #TODO replace with the URL of your ReactJS application
]
CORS_ALLOWED_ORIGINS = [ #TODO replacte with actual URL
    'http://localhost',
    'http://127.0.0.1',
    'http://0.0.0.0',
]
CSRF_TRUSTED_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
CORS_ALLOW_CREDENTIALS = True
ROOT_URLCONF = 'BoutiqueGourmet.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates']
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'BoutiqueGourmet.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = { ##TODO change to RDS
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'controle_buffet',
        'USER': 'postgres',
        'PASSWORD': '900505',
        'HOST': 'localhost',  # Ou o endereço do servidor de banco de dados
        'PORT': '5432',  # O padrão é 5432
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
}
# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'pt-br'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = 'login'

DJANGO_LOG_LEVEL = DEBUG
CORS_ORIGIN_ALLOW_ALL = True

SESSION_COOKIE_HTTPONLY = False #TODO change to TRUE to security
SESSION_COOKIE_SECURE = False  # Defina como True em produção
SESSION_COOKIE_SAMESITE = 'Lax'  # Pode ser 'Strict' ou 'None' conforme suas necessidades
