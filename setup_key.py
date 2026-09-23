"""Run locally to enter a key without echoing it or including it in shell history."""
import getpass
import os
from pathlib import Path

path = Path(__file__).resolve().parent / '.env'
key = getpass.getpass('OpenAI API key (ввод скрыт): ').strip()
if not key or any(c.isspace() for c in key):
    raise SystemExit('Пустой ключ или пробелы: файл не изменён.')
lines = path.read_text().splitlines() if path.exists() else []
lines = [line for line in lines if not line.startswith('OPENAI_API_KEY=')]
lines.append('OPENAI_API_KEY=' + key)
fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
with os.fdopen(fd, 'w') as f:
    f.write('\n'.join(lines) + '\n')
os.chmod(path, 0o600)
print('Ключ сохранён локально. Перезапустите server.py. Ключ не добавляется в Git.')
