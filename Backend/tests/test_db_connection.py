from app.core.config import settings
from app.database.connection import build_db_connect_args


def test_mysql_url_gets_connect_and_io_timeouts():
    args = build_db_connect_args(
        "mysql+pymysql://user:password@localhost/himatkn_v2"
    )

    assert args == {
        "connect_timeout": 10,
        "read_timeout": 30,
        "write_timeout": 30,
    }


def test_mysql_timeouts_follow_settings(monkeypatch):
    monkeypatch.setattr(settings, "db_connect_timeout", 3)
    monkeypatch.setattr(settings, "db_read_timeout", 7)
    monkeypatch.setattr(settings, "db_write_timeout", 9)

    args = build_db_connect_args(
        "mysql+pymysql://user:password@localhost/himatkn_v2"
    )

    assert args == {
        "connect_timeout": 3,
        "read_timeout": 7,
        "write_timeout": 9,
    }


def test_sqlite_url_has_no_connect_args():
    assert build_db_connect_args("sqlite:///./test.sqlite3") == {}


def test_unknown_url_has_no_connect_args():
    assert build_db_connect_args("not-a-url") == {}
