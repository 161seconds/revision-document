//! Source-pixel reuse is separate from compositional fidelity.
use crate::raster::Image;

/// Require near-identical registered RGB pixels, not just the same silhouette.
/// Downsampling absorbs encoding/resampling noise; a bounded fractional shift
/// catches small rolls without searching for arbitrary lookalike subimages.
/// Flat fields are not sufficient evidence of common origin.
/// The residual allowance is 7/255 per channel after registration; this is a
/// conservative copy signal, not a provenance proof for arbitrary transforms.
pub fn is_transformed_copy(reference: &Image, candidate: &Image) -> bool {
    if reference.width < 16
        || reference.height < 16
        || candidate.width < 16
        || candidate.height < 16
    {
        return false;
    }
    let ratio = reference.width as f64 / reference.height as f64;
    let other = candidate.width as f64 / candidate.height as f64;
    if (ratio / other - 1.0).abs() > 0.03 {
        return false;
    }
    let w = 32usize;
    let h = ((32.0 / ratio).round() as usize).clamp(16, 64);
    let a = smooth(&area_reduce(reference, w, h));
    let b = smooth(&area_reduce(candidate, w, h));
    let sample = |x: f64, y: f64, c: usize| {
        let ix = x.floor() as usize;
        let iy = y.floor() as usize;
        let fx = x - ix as f64;
        let fy = y - iy as f64;
        let p = |xx, yy| b.data[(yy * w + xx) * 4 + c] as f64;
        p(ix, iy) * (1.0 - fx) * (1.0 - fy)
            + p(ix + 1, iy) * fx * (1.0 - fy)
            + p(ix, iy + 1) * (1.0 - fx) * fy
            + p(ix + 1, iy + 1) * fx * fy
    };
    for sy in -8..=8 {
        for sx in -8..=8 {
            let (dx, dy) = (sx as f64 / 8.0, sy as f64 / 8.0);
            let (mut n, mut sa, mut sb, mut aa, mut bb, mut ab, mut error) =
                (0.0, [0.0; 3], [0.0; 3], 0.0, 0.0, 0.0, 0.0);
            for y in 2..h - 2 {
                for x in 2..w - 2 {
                    for c in 0..3 {
                        let av = a.data[(y * w + x) * 4 + c] as f64;
                        let bv = sample(x as f64 + dx, y as f64 + dy, c);
                        n += 1.0;
                        sa[c] += av;
                        sb[c] += bv;
                        aa += av * av;
                        bb += bv * bv;
                        ab += av * bv;
                        error += (av - bv) * (av - bv);
                    }
                }
            }
            let pixels = n / 3.0;
            let va = aa - sa.iter().map(|v| v * v / pixels).sum::<f64>();
            let vb = bb - sb.iter().map(|v| v * v / pixels).sum::<f64>();
            if va / n < 324.0 || vb / n < 324.0 {
                continue;
            }
            let covariance = ab - (0..3).map(|c| sa[c] * sb[c] / pixels).sum::<f64>();
            let correlation = covariance / (va * vb).sqrt();
            if correlation >= 0.995 && (error / n).sqrt() <= 7.0 {
                return true;
            }
        }
    }
    false
}

// A small, identical low-pass filter removes residual phase differences at
// hard edges. Comparisons below skip the untouched outer margin.
fn smooth(image: &Image) -> Image {
    let mut out = image.clone();
    let weights = [1.0, 2.0, 1.0];
    for y in 1..image.height - 1 {
        for x in 1..image.width - 1 {
            for c in 0..3 {
                let mut sum = 0.0;
                for dy in 0..3 {
                    for dx in 0..3 {
                        sum += image.data[((y + dy - 1) * image.width + x + dx - 1) * 4 + c] as f64
                            * weights[dy]
                            * weights[dx];
                    }
                }
                out.data[(y * image.width + x) * 4 + c] = (sum / 16.0).round() as u8;
            }
        }
    }
    out
}

// Area averaging removes aliasing before comparing differently sized versions.
// Bilinear resize alone samples high-frequency edges differently after a roll.
fn area_reduce(image: &Image, w: usize, h: usize) -> Image {
    if image.width < w || image.height < h {
        return crate::raster::resize(image, w as f64, h as f64);
    }
    let mut out = crate::raster::create_image(w, h, [0, 0, 0, 255]);
    let sx = image.width as f64 / w as f64;
    let sy = image.height as f64 / h as f64;
    for y in 0..h {
        let top = y as f64 * sy;
        let bottom = (y + 1) as f64 * sy;
        for x in 0..w {
            let left = x as f64 * sx;
            let right = (x + 1) as f64 * sx;
            let mut sums = [0.0; 3];
            for iy in top.floor() as usize..(bottom.ceil() as usize).min(image.height) {
                let wy = bottom.min((iy + 1) as f64) - top.max(iy as f64);
                for ix in left.floor() as usize..(right.ceil() as usize).min(image.width) {
                    let weight = wy * (right.min((ix + 1) as f64) - left.max(ix as f64));
                    for c in 0..3 {
                        sums[c] += image.data[(iy * image.width + ix) * 4 + c] as f64 * weight;
                    }
                }
            }
            for c in 0..3 {
                out.data[(y * w + x) * 4 + c] = (sums[c] / (sx * sy)).round() as u8;
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{png_io::decode_png, raster};
    fn reference() -> Image {
        decode_png(include_bytes!("../tests/fixtures/comp-copy/reference.png"))
            .unwrap()
            .image
    }
    #[test]
    fn stripped_rescaled_blurred_and_rolled_reference_is_still_a_copy() {
        let transformed = decode_png(include_bytes!(
            "../tests/fixtures/comp-copy/transformed.png"
        ))
        .unwrap();
        assert!(transformed.text.is_empty());
        assert!(is_transformed_copy(&reference(), &transformed.image));
    }
    #[test]
    fn hard_edges_survive_resampling_without_aliasing_away_the_match() {
        let original = decode_png(include_bytes!(
            "../tests/fixtures/comp-copy/detailed-reference.png"
        ))
        .unwrap();
        let transformed = decode_png(include_bytes!(
            "../tests/fixtures/comp-copy/detailed-transformed.png"
        ))
        .unwrap();
        assert!(is_transformed_copy(&original.image, &transformed.image));
    }
    #[test]
    fn matching_geometry_with_different_color_or_aspect_is_not_enough() {
        let original = reference();
        let mut recolored = original.clone();
        for pixel in recolored.data.chunks_exact_mut(4) {
            pixel[0] = pixel[0].saturating_sub(25);
            pixel[2] = pixel[2].saturating_add(25);
        }
        assert!(!is_transformed_copy(&original, &recolored));
        let stretched = raster::resize(&original, 256.0, 96.0);
        assert!(!is_transformed_copy(&original, &stretched));
    }
    #[test]
    fn independent_pixels_and_common_flat_backgrounds_are_not_copy_proof() {
        let independent = decode_png(include_bytes!(
            "../tests/fixtures/comp-copy/independent.png"
        ))
        .unwrap()
        .image;
        assert!(!is_transformed_copy(&reference(), &independent));
        let flat = raster::create_image(128, 96, [240, 230, 210, 255]);
        assert!(!is_transformed_copy(&flat, &flat));
        let saturated = raster::create_image(128, 96, [250, 20, 20, 255]);
        assert!(!is_transformed_copy(&saturated, &saturated));
    }
}
