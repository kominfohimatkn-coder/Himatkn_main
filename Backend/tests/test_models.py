import pytest
from collections import Counter
from sqlalchemy.exc import IntegrityError
from app.database.connection import Base, SessionLocal
from app.models import Admin, Period, Division

def test_no_duplicate_tables():
    names=[t.name for t in Base.metadata.sorted_tables]
    dup=[n for n,c in Counter(names).items() if c>1]
    assert not dup
    assert len(names)==23

def test_unique_admin_constraint():
    with SessionLocal() as db:
        db.add(Admin(username='constraint-test',password_hash='x'))
        db.commit()
        db.add(Admin(username='constraint-test',password_hash='y'))
        with pytest.raises(IntegrityError): db.commit()
        db.rollback()

def test_foreign_key_constraint():
    with SessionLocal() as db:
        db.add(Division(period_id=999999,name='bad',description=None,sort_order=0))
        with pytest.raises(IntegrityError): db.commit()
        db.rollback()
