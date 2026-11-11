# Source-pixel regression fixtures

`reference.png` is synthetic RGB artwork with smoothly varying color, shapes,
and fine noise. `independent.png` uses the same palette and construction with a
different seed. Neither contains photographs or user artifacts.

`transformed.png` reproduces the image-processing sequence observed in a Gemini
comp-led eval. From this directory:

```sh
magick reference.png -strip -resize 300% -scale 94% -scale 106.38% -blur 0x0.7 -roll +2+1 transformed.png
```

The crate test verifies the PNG has no retained source metadata. The gate test
adds an invented generation prompt before checking it: prompt metadata is not
proof of generation. Texture patches retain their explicit exemption.

This is a regression for resampling, mild blur and small translations, not a
claim to identify every possible transformed copy. The independent-pixel and
flat-field checks guard against treating a shared palette as proof of copying.

`detailed-reference.png` is a synthetic grid of colored panels with hard edges
(seed 917). `detailed-transformed.png` applies the same command to it, guarding
against aliasing during differently sized image comparisons.
