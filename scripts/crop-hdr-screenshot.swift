// Crop a macOS HDR (gain-map) HEIC into an SDR base and an HDR alternate, identically.
// usage: swift scripts/crop-hdr-screenshot.swift in.heic out-sdr.png out-hdr.png
// Coordinates below are in top-left image pixels; Core Image's origin is bottom-left.
//
// Used for assets/img/tapline-blazor-realtime-amber.avif, from a macOS HDR screenshot
// of the BlazorRealtime sample (2330x1542). The crop and patch rectangles below are
// specific to that screenshot. Then:
//   avifgainmaputil combine out-sdr.png out-hdr.png out.avif --cicp-base 12/13/6 \
//     --cicp-alternate 12/16/6 --ignore-profile -d 10 -q 72 --qgain-map 70 --downscaling 2 -s 4
import CoreImage
import Foundation

let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1])

guard let sdr = CIImage(contentsOf: input),
      let hdr = CIImage(contentsOf: input, options: [.expandToHDR: true]) else {
    fatalError("could not read \(input.path)")
}
let H = sdr.extent.height
func ciRect(x: CGFloat, y: CGFloat, w: CGFloat, h: CGFloat) -> CGRect {
    CGRect(x: x, y: H - y - h, width: w, height: h)
}

// Cover the faint pause/volume controls (x≈1100–1245, y≈1316–1368) with the plain
// scanline background from just left of them, same rows, so scanlines stay aligned.
let patchSrc = ciRect(x: 875, y: 1316, w: 150, h: 52)
let patchDX: CGFloat = 225

// 16:10 frame centred on the artwork (x 1165, y ≈774), inside the window content.
let crop = ciRect(x: 221, y: 184, w: 1888, h: 1180)
let outWidth: CGFloat = 1600

func render(_ img: CIImage) -> CIImage {
    let patch = img.cropped(to: patchSrc).transformed(by: CGAffineTransform(translationX: patchDX, y: 0))
    let patched = patch.composited(over: img)
    let cropped = patched.cropped(to: crop)
        .transformed(by: CGAffineTransform(translationX: -crop.minX, y: -crop.minY))
    let scale = outWidth / crop.width
    let f = CIFilter(name: "CILanczosScaleTransform")!
    f.setValue(cropped, forKey: kCIInputImageKey)
    f.setValue(scale, forKey: kCIInputScaleKey)
    f.setValue(1.0, forKey: kCIInputAspectRatioKey)
    let out = f.outputImage!
    return out.cropped(to: CGRect(x: 0, y: 0, width: outWidth.rounded(), height: (crop.height * scale).rounded()))
}

let ctx = CIContext(options: [.workingColorSpace: CGColorSpace(name: CGColorSpace.extendedLinearDisplayP3)!,
                              .workingFormat: CIFormat.RGBAh])
try ctx.writePNGRepresentation(of: render(sdr), to: URL(fileURLWithPath: args[2]),
                               format: .RGBA16, colorSpace: CGColorSpace(name: CGColorSpace.displayP3)!)
try ctx.writePNGRepresentation(of: render(hdr), to: URL(fileURLWithPath: args[3]),
                               format: .RGBA16, colorSpace: CGColorSpace(name: CGColorSpace.displayP3_PQ)!)

// Report the HDR rendition's peak relative to SDR white, to confirm the gain map was applied.
func peak(_ img: CIImage) -> Float {
    let f = CIFilter(name: "CIAreaMaximum")!
    f.setValue(img, forKey: kCIInputImageKey)
    f.setValue(CIVector(cgRect: img.extent), forKey: kCIInputExtentKey)
    var px = [Float](repeating: 0, count: 4)
    ctx.render(f.outputImage!, toBitmap: &px, rowBytes: 16, bounds: CGRect(x: 0, y: 0, width: 1, height: 1),
               format: .RGBAf, colorSpace: CGColorSpace(name: CGColorSpace.extendedLinearDisplayP3)!)
    return max(px[0], px[1], px[2])
}
print(String(format: "peak (linear, 1.0 = SDR white): SDR %.2f  HDR %.2f", peak(render(sdr)), peak(render(hdr))))
