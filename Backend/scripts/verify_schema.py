

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from sqlalchemy import Index, UniqueConstraint
from sqlalchemy.dialects import mysql

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database.connection import Base  # noqa: E402
from app import models  # noqa: F401,E402

EXPECTED_DOMAIN_TABLES = 22


@dataclass(frozen=True)
class SqlColumn:
    name: str
    type: str
    nullable: bool
    default: str | None
    on_update: str | None


@dataclass(frozen=True)
class SqlForeignKey:
    columns: tuple[str, ...]
    ref_table: str
    ref_columns: tuple[str, ...]
    on_delete: str | None
    on_update: str | None


@dataclass
class SqlTable:
    columns: dict[str, SqlColumn] = field(default_factory=dict)
    primary_key: tuple[str, ...] = ()
    unique_constraints: set[tuple[str, ...]] = field(default_factory=set)
    indexes: set[tuple[tuple[str, ...], bool]] = field(default_factory=set)
    foreign_keys: set[SqlForeignKey] = field(default_factory=set)


_IDENTIFIER = r"(?:`([^`]+)`|([A-Za-z_][A-Za-z0-9_]*))"


def identifier(match: re.Match[str]) -> str:
    return match.group(1) or match.group(2)


def split_top_level(text: str) -> list[str]:
    parts: list[str] = []
    start = 0
    depth = 0
    quote: str | None = None
    escape = False

    for i, char in enumerate(text):
        if quote:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == quote:
                quote = None
            continue

        if char in {"'", '"', "`"}:
            quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        elif char == "," and depth == 0:
            parts.append(text[start:i].strip())
            start = i + 1

    tail = text[start:].strip()
    if tail:
        parts.append(tail)
    return parts


def extract_create_tables(sql: str) -> dict[str, str]:
    matches = list(re.finditer(r"\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?", sql, re.I))
    tables: dict[str, str] = {}

    for match in matches:
        pos = match.end()
        name_match = re.match(_IDENTIFIER, sql[pos:])
        if not name_match:
            raise ValueError(f"Cannot parse table name near offset {pos}")

        table_name = identifier(name_match)
        pos += name_match.end()

        while pos < len(sql) and sql[pos].isspace():
            pos += 1
        if pos >= len(sql) or sql[pos] != "(":
            raise ValueError(f"Expected '(' after table {table_name}")

        body_start = pos + 1
        depth = 1
        quote: str | None = None
        escape = False
        i = body_start

        while i < len(sql) and depth:
            char = sql[i]
            if quote:
                if escape:
                    escape = False
                elif char == "\\":
                    escape = True
                elif char == quote:
                    quote = None
            else:
                if char in {"'", '"', "`"}:
                    quote = char
                elif char == "(":
                    depth += 1
                elif char == ")":
                    depth -= 1
            i += 1

        if depth != 0:
            raise ValueError(f"Unclosed CREATE TABLE body for {table_name}")

        tables[table_name] = sql[body_start : i - 1]

    return tables


def parse_columns_list(value: str) -> tuple[str, ...]:
    return tuple(
        token.strip().strip("`")
        for token in split_top_level(value.strip().strip("()"))
        if token.strip()
    )


def normalize_sql_value(value: str | None) -> str | None:
    if value is None:
        return None

    value = value.strip().rstrip(",")
    while len(value) >= 2 and value[0] == "(" and value[-1] == ")":
        inner = value[1:-1].strip()
        if not inner:
            break
        value = inner

    upper = value.upper()
    if upper in {"CURRENT_TIMESTAMP", "CURRENT_TIMESTAMP()", "NOW()", "NOW"}:
        return "CURRENT_TIMESTAMP"
    if upper == "TRUE":
        return "1"
    if upper == "FALSE":
        return "0"

    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        value = value[1:-1]

    return value.strip().upper()


def normalize_type(value: str) -> str:
    value = re.sub(r"\s+", " ", value.strip().upper())
    if value == "BOOL":
        value = "BOOLEAN"
    elif value == "INTEGER":
        value = "INT"
    value = re.sub(r"\s*\(\s*", "(", value)
    value = re.sub(r"\s*\)\s*", ")", value)
    return value


def parse_column_definition(definition: str) -> SqlColumn | None:
    match = re.match(
        rf"^\s*{_IDENTIFIER}\s+(?P<type>BIGINT(?:\s+UNSIGNED)?|INT(?:EGER)?(?:\s+UNSIGNED)?|BOOLEAN|BOOL|DATE|DATETIME|TIMESTAMP|VARCHAR\s*\(\s*\d+\s*\)|CHAR\s*\(\s*\d+\s*\)|TEXT|LONGTEXT)(?=\s|$)(?P<rest>.*)$",
        definition,
        re.I | re.S,
    )
    if not match:
        return None

    name = identifier(match)
    type_name = normalize_type(match.group("type"))
    rest = match.group("rest").strip()

    default_match = re.search(
        r"\bDEFAULT\s+(.+?)(?=\s+ON\s+UPDATE\b|$)",
        rest,
        re.I | re.S,
    )
    on_update_match = re.search(
        r"\bON\s+UPDATE\s+(.+)$",
        rest,
        re.I | re.S,
    )

    return SqlColumn(
        name=name,
        type=type_name,
        nullable=not bool(re.search(r"\bNOT\s+NULL\b", rest, re.I)),
        default=normalize_sql_value(default_match.group(1) if default_match else None),
        on_update=normalize_sql_value(on_update_match.group(1) if on_update_match else None),
    )


def parse_table(table_name: str, body: str) -> SqlTable:
    table = SqlTable()

    for definition in split_top_level(body):
        stripped = definition.strip()

        column = parse_column_definition(stripped)
        if column:
            table.columns[column.name] = column
            continue

        primary_match = re.match(r"^PRIMARY\s+KEY\s*(\(.*\))", stripped, re.I | re.S)
        if primary_match:
            table.primary_key = parse_columns_list(primary_match.group(1))
            continue

        unique_match = re.match(
            r"^(?:CONSTRAINT\s+[^\s]+\s+)?UNIQUE(?:\s+KEY|\s+INDEX)?\s*(?:[^\s(]+\s*)?(\(.*\))",
            stripped,
            re.I | re.S,
        )
        if unique_match:
            table.unique_constraints.add(parse_columns_list(unique_match.group(1)))
            continue

        index_match = re.match(
            r"^(?:FULLTEXT\s+|SPATIAL\s+)?(?:KEY|INDEX)\s+[^\s(]+\s*(\(.*\))",
            stripped,
            re.I | re.S,
        )
        if index_match:
            columns = parse_columns_list(index_match.group(1))
            table.indexes.add((columns, False))
            continue

        fk_match = re.match(
            r"^CONSTRAINT\s+[^\s]+\s+FOREIGN\s+KEY\s*(\(.*?\))\s+REFERENCES\s+(?:`([^`]+)`|([A-Za-z_][A-Za-z0-9_]*))\s*(\(.*?\))(.*)$",
            stripped,
            re.I | re.S,
        )
        if fk_match:
            source = parse_columns_list(fk_match.group(1))
            ref_table = fk_match.group(2) or fk_match.group(3)
            ref_columns = parse_columns_list(fk_match.group(4))
            rest = fk_match.group(5)

            on_delete_match = re.search(r"\bON\s+DELETE\s+(RESTRICT|CASCADE|SET\s+NULL|SET\s+DEFAULT|NO\s+ACTION)", rest, re.I)
            on_update_match = re.search(r"\bON\s+UPDATE\s+(RESTRICT|CASCADE|SET\s+NULL|SET\s+DEFAULT|NO\s+ACTION)", rest, re.I)

            def action(match: re.Match[str] | None) -> str | None:
                if not match:
                    return None
                return re.sub(r"\s+", " ", match.group(1).upper())

            table.foreign_keys.add(
                SqlForeignKey(
                    columns=source,
                    ref_table=ref_table,
                    ref_columns=ref_columns,
                    on_delete=action(on_delete_match),
                    on_update=action(on_update_match),
                )
            )
            continue

        # Ignore table-level comments/options and any syntax this validator does not model.

    return table


def model_type(column: Any) -> str:
    return normalize_type(column.type.compile(dialect=mysql.dialect()))


def model_default(column: Any) -> str | None:
    if column.server_default is None:
        return None

    arg = column.server_default.arg
    try:
        rendered = str(arg.compile(dialect=mysql.dialect()))
    except AttributeError:
        rendered = str(arg)
    return normalize_sql_value(rendered)


def model_unique_constraints(table: Any) -> set[tuple[str, ...]]:
    result: set[tuple[str, ...]] = set()
    for constraint in table.constraints:
        if isinstance(constraint, UniqueConstraint):
            result.add(tuple(column.name for column in constraint.columns))
    for index in table.indexes:
        if index.unique:
            result.add(tuple(column.name for column in index.columns))
    return result


def model_indexes(table: Any) -> set[tuple[tuple[str, ...], bool]]:
    return {
        (tuple(column.name for column in index.columns), bool(index.unique))
        for index in table.indexes
        if not index.unique
    }


def model_foreign_keys(table: Any) -> set[SqlForeignKey]:
    result: set[SqlForeignKey] = set()
    for constraint in table.foreign_key_constraints:
        result.add(
            SqlForeignKey(
                columns=tuple(column.name for column in constraint.columns),
                ref_table=constraint.referred_table.name,
                ref_columns=tuple(element.column.name for element in constraint.elements),
                on_delete=(constraint.ondelete or None) and constraint.ondelete.upper(),
                on_update=(constraint.onupdate or None) and constraint.onupdate.upper(),
            )
        )
    return result


def compare(schema_path: Path) -> list[str]:
    sql_tables = {
        name: parse_table(name, body)
        for name, body in extract_create_tables(schema_path.read_text(encoding="utf-8")).items()
    }
    model_tables = dict(Base.metadata.tables)

    issues: list[str] = []

    sql_names = set(sql_tables)
    model_names = set(model_tables)
    if sql_names != model_names:
        issues.append(
            f"tables: SQL-only={sorted(sql_names - model_names)}, model-only={sorted(model_names - sql_names)}"
        )

    if len(model_names) != EXPECTED_DOMAIN_TABLES:
        issues.append(
            f"models: expected {EXPECTED_DOMAIN_TABLES} domain tables, found {len(model_names)}"
        )

    for name in sorted(sql_names & model_names):
        sql_table = sql_tables[name]
        model_table = model_tables[name]

        sql_columns = set(sql_table.columns)
        model_columns = set(model_table.columns.keys())
        if sql_columns != model_columns:
            issues.append(
                f"{name}: columns SQL-only={sorted(sql_columns - model_columns)}, model-only={sorted(model_columns - sql_columns)}"
            )

        for column_name in sorted(sql_columns & model_columns):
            sql_col = sql_table.columns[column_name]
            model_col = model_table.columns[column_name]

            expected_type = model_type(model_col)
            if sql_col.type != expected_type:
                issues.append(
                    f"{name}: column {column_name}: type SQL={sql_col.type!r}, model={expected_type!r}"
                )

            if sql_col.nullable != model_col.nullable:
                issues.append(
                    f"{name}: column {column_name}: nullable SQL={sql_col.nullable}, model={model_col.nullable}"
                )

            expected_default = model_default(model_col)
            if sql_col.default != expected_default:
                issues.append(
                    f"{name}: column {column_name}: default SQL={sql_col.default!r}, model={expected_default!r}"
                )

            # Do not compare SQL ON UPDATE to Column.onupdate.
            # SQL ON UPDATE is a server-side DDL feature; SQLAlchemy's onupdate
            # is ORM-side behavior. They are different metadata concepts.

        sql_pk = sql_table.primary_key
        model_pk = tuple(column.name for column in model_table.primary_key.columns)
        if sql_pk != model_pk:
            issues.append(
                f"{name}: primary key SQL={sql_pk}, model={model_pk}"
            )

        sql_unique = sql_table.unique_constraints
        model_unique = model_unique_constraints(model_table)
        if sql_unique != model_unique:
            issues.append(
                f"{name}: unique SQL={sorted(sql_unique)}, model={sorted(model_unique)}"
            )

        sql_indexes = sql_table.indexes
        model_indexes_set = model_indexes(model_table)
        if sql_indexes != model_indexes_set:
            issues.append(
                f"{name}: indexes SQL={sorted(sql_indexes)}, model={sorted(model_indexes_set)}"
            )

        sql_fks = sql_table.foreign_keys
        model_fks = model_foreign_keys(model_table)
        if sql_fks != model_fks:
            issues.append(
                f"{name}: foreign keys SQL={sorted(sql_fks, key=str)}, model={sorted(model_fks, key=str)}"
            )

    return issues


def main() -> int:
    schema_path = ROOT / "database" / "schema.sql"
    if not schema_path.exists():
        print(f"SCHEMA_ERROR: missing {schema_path}")
        return 1

    issues = compare(schema_path)
    if issues:
        print("SCHEMA_MISMATCH")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print(
        "SCHEMA_OK\n"
        f"{EXPECTED_DOMAIN_TABLES} tables\n"
        "columns, types, nullability, defaults, primary keys, unique constraints, indexes, foreign keys match"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())