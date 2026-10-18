"""
HealthBook analytics configuration package.
Includes Python 3.14+ compatibility patch for Django 5.0 BaseContext copying.
"""
import sys

if sys.version_info >= (3, 14):
    from django.template.context import BaseContext
    def _basecontext_copy(self):
        obj = self.__class__.__new__(self.__class__)
        obj.__dict__.update(self.__dict__)
        obj.dicts = self.dicts[:]
        return obj
    BaseContext.__copy__ = _basecontext_copy
