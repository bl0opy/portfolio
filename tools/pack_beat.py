import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def beat_key() -> bytes:
    source = (ROOT / "src" / "sound.js").read_text()
    return re.search(r"const BEAT_KEY = '(.+)';", source).group(1).encode()


def main() -> None:
    parser = argparse.ArgumentParser(description="Scramble an encoded track into the file the site plays.")
    parser.add_argument("track", type=Path)
    args = parser.parse_args()

    key = beat_key()
    data = args.track.read_bytes()
    packed = bytes(byte ^ key[i % len(key)] for i, byte in enumerate(data))
    (ROOT / "assets" / "audio" / "track.dat").write_bytes(packed)


if __name__ == "__main__":
    main()
