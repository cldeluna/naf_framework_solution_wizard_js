"""
test_connection.py
==================
Read-only connectivity check for your Supabase Postgres database.

Connects using the same configuration as ``setup_db.py`` (``SUPABASE_DB_URL``,
or ``SUPABASE_URL`` + ``SUPABASE-PWD``), prints the server version, and lists the
tables in the ``public`` schema. Before you run the migration this should report
**no tables**; after ``setup_db.py`` it will show ``solutions``.

Usage (from the project root):
    uv run python supabase/test_connection.py

This script only reads (``select`` on ``information_schema``); it never writes.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow importing the sibling setup_db module (reuse its connection logic).
sys.path.insert(0, str(Path(__file__).resolve().parent))

from setup_db import _connection, _load_env, _redacted  # noqa: E402


def main() -> None:
    _load_env()
    conn_kwargs, source = _connection()
    print(f"Config source : {source}")
    print(f"Connection    : {_redacted(conn_kwargs)}")

    try:
        import psycopg2
    except ImportError:
        sys.exit("psycopg2 is not installed. Run: uv sync")

    print("\nConnecting…")
    try:
        if "dsn" in conn_kwargs:
            conn = psycopg2.connect(conn_kwargs["dsn"])
        else:
            conn = psycopg2.connect(**conn_kwargs)
    except Exception as exc:  # noqa: BLE001
        sys.exit(
            f"Connection failed: {exc}\n\n"
            "Tip: new Supabase projects often require the pooler for IPv4. Copy "
            "the 'Session pooler' URI from the dashboard (Project Settings -> "
            "Database -> Connection string -> URI) into SUPABASE_DB_URL in .env, "
            "then retry."
        )

    try:
        with conn.cursor() as cur:
            cur.execute("select version();")
            version = cur.fetchone()[0]
            cur.execute(
                "select table_name from information_schema.tables "
                "where table_schema = 'public' order by table_name;"
            )
            tables = [row[0] for row in cur.fetchall()]

        print("Connected ✅")
        print(f"Server        : {version.split(',')[0]}")
        if tables:
            print(f"Public tables ({len(tables)}):")
            for name in tables:
                print(f"  - {name}")
        else:
            print(
                "Public tables : none yet — run "
                "`uv run python supabase/setup_db.py --verify` to create the schema."
            )
    finally:
        conn.close()


if __name__ == "__main__":
    main()
