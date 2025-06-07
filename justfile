alias l := lint
alias f := format
alias r := run

lint:
    uv run ruff check

format:
    uv run ruff format

run:
    uv run main.py

asp:
    uv run social-scraping/asp.py