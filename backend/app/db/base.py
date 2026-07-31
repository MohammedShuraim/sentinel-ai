from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# NOTE: Do not import models here — it causes a circular import
# (models import Base from this module). Models are aggregated for
# Alembic discovery in app/db/base_models.py instead.