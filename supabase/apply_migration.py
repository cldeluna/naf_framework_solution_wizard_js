"""
apply_migration.py
==================
Apply an arbitrary (additive) SQL migration file over the direct Postgres
connection. Reuses the connection config from setup_db.py.

    uv run python supabase/apply_migration.py supabase/migrations/0002_add_use_cases.sql

Use for non-destructive migrations (ALTER TABLE ... ADD COLUMN IF NOT EXISTS,
etc.). Review the SQL first.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from setup_db import _connection, _load_env, _redacted  # noqa: E402


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage: apply_migration.py <path-to-.sql>")
    sql_path = Path(sys.argv[1])
    if not sql_path.exists():
        sys.exit(f"File not found: {sql_path}")
    sql = sql_path.read_text()

    _load_env()
    conn_kwargs, source = _connection()
    print(f"Config source : {source}")
    print(f"Connection    : {_redacted(conn_kwargs)}")
    print(f"Applying      : {sql_path} ({len(sql):,} bytes)")

    try:
        import psycopg2
    except ImportError:
        sys.exit("psycopg2 is not installed. Run: uv sync")

    conn = (
        psycopg2.connect(conn_kwargs["dsn"])
        if "dsn" in conn_kwargs
        else psycopg2.connect(**conn_kwargs)
    )
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(sql)
        print("Applied ✅")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
