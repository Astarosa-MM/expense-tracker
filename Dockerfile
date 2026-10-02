FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py exchange_rates.py ./
COPY public ./public
ENV PORT=8000 DATABASE_PATH=/data/expenses.sqlite3
EXPOSE 8000
CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT} --workers 1 --threads 4 'server:create_app()'"]
