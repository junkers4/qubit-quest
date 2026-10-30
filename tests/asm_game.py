"""Drives the assembler game (build/libqqgame.so: the core with an
in-memory save) without a window: keys and clicks in, screenshots
of its frame buffer out. Used by tests/test_asm_game.py."""
import ctypes
import pathlib
import struct
import zlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
LIB = ROOT / "build" / "libqqgame.so"
W, H = 320, 200

# asm/core/game.inc
K = {"back": 8, "enter": 13, "esc": 27, "up": 0x101, "down": 0x102,
     "left": 0x103, "right": 0x104, "next": 0x105}
K_ITEM, K_LEVEL, K_GATE, K_WIRE = 0x200, 0x300, 0x400, 0x500


class Game:
    def __init__(self, unlock=False, lib=None):
        self.lib = lib or ctypes.CDLL(str(LIB))
        self.lib.game_init(1 if unlock else 0)
        self.draw()

    def var(self, name):
        return ctypes.c_int32.in_dll(self.lib, name).value

    @property
    def screen(self):
        return ["title", "map", "level", "done"][self.var("game_screen")]

    def key(self, k):
        if isinstance(k, str):
            k = K[k] if k in K else ord(k)
        self.lib.game_key(k)
        self.draw()

    def click(self, x, y):
        self.lib.game_click(x, y)
        self.draw()

    def draw(self):
        self.lib.game_draw()

    def pixels(self):
        fb = (ctypes.c_uint32 * (W * H)).in_dll(self.lib, "fb")
        return list(fb)

    def png(self, path, scale=3):
        px = self.pixels()
        raw = bytearray()
        for y in range(H * scale):
            raw.append(0)
            row = px[(y // scale) * W:(y // scale + 1) * W]
            for p in row:
                raw += bytes([(p >> 16) & 255, (p >> 8) & 255, p & 255]) * scale
        def chunk(t, d):
            c = struct.pack(">I", len(d)) + t + d
            return c + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
        data = (b"\x89PNG\r\n\x1a\n"
                + chunk(b"IHDR", struct.pack(">IIBBBBB", W * scale, H * scale, 8, 2, 0, 0, 0))
                + chunk(b"IDAT", zlib.compress(bytes(raw), 6))
                + chunk(b"IEND", b""))
        pathlib.Path(path).write_bytes(data)
