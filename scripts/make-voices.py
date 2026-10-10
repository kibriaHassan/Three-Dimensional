import asyncio
import re
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / "src" / "lab" / "sound.ts").read_text(encoding="utf-8")
block = source.split("const scripts", 1)[1].split("};", 1)[0]
entries = re.compile(r'(?:"([^"]+)"|([A-Za-z0-9_-]+))\s*:\s*\[(.*?)\]\s*,', re.S)
texts = re.compile(r'text:\s*"((?:\\.|[^"\\])*)"')
out = ROOT / "public" / "voice"
out.mkdir(parents=True, exist_ok=True)

jobs: list[tuple[str, int, str]] = []
for match in entries.finditer(block):
    demo_id = match.group(1) or match.group(2)
    for index, text in enumerate(texts.findall(match.group(3))):
        jobs.append((demo_id, index, text))


async def save(demo_id: str, index: int, text: str, gate: asyncio.Semaphore) -> None:
    dest = out / f"{demo_id}-{index}.mp3"
    async with gate:
        await edge_tts.Communicate(text, "bn-BD-NabanitaNeural", rate="-8%").save(str(dest))
    print(f"{demo_id}-{index} {dest.stat().st_size}")


async def main() -> None:
    gate = asyncio.Semaphore(4)
    await asyncio.gather(*(save(*job, gate) for job in jobs))
    print("lines", len(jobs))


asyncio.run(main())
