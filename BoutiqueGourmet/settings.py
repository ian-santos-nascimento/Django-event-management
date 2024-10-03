import os
from email.policy import default
from os import environ
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', default='django-insecure-#9_owqwd8a0#os0qqav)+hnlh^rltb1i0cd&#t@=i6$5@+p)g6')

DEBUG = os.environ.get('DEBUG', default='False')
APP_NAME = os.environ.get("FLY_APP_NAME")
ALLOWED_HOSTS = ['*']  ##TODO CHANGE TO INSTANCE IP e DOMAIN.COM.BR

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
    "whitenoise.middleware.WhiteNoiseMiddleware"
]

CORS_ALLOWED_ORIGINS = [
    'https://frontend-mu-rose.vercel.app','http://localhost:3000','http://192.168.0.13:3000', 'http://127.0.0.1:3000'
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://192.168.0.13:3000',
    'http://127.0.0.1:3000',
    'https://frontend-mu-rose.vercel.app',
    'https://*.fly.dev'
]
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

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ['DATABASE_URL']
    )
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
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}
# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'pt-br'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = "bootstrap5"
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = 'login'

DJANGO_LOG_LEVEL = DEBUG
# CSRF Cookie Settings
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = False  # Deve ser False para permitir acesso via JavaScript, se necessário
# Session Cookie Settings
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = True
