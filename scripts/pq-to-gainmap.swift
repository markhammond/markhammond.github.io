// Split an HDR image tagged with a PQ colour profile into an SDR base (tone mapped)
// and an HDR alternate, both resized identically, for avifgainmaputil combine.
// usage: swift scripts/pq-to-gainmap.swift in.png out-sdr.png out-hdr.png [width]
//
// Used for assets/img/tapline-blazor_realtime.avif, from the macOS HDR screenshot of the
// Tapline samples (PNG tagged Display P3 / PQ, 1950 px wide), at width 1200. Then:
//   avifgainmaputil combine out-sdr.png out-hdr.png out.avif --cicp-base 12/13/6 \
//     --cicp-alternate 12/16/6 --ignore-profile -d 10 -q 74 --qgain-map 70 --qalpha 80 --downscaling 2 -s 4
// A WebP or PNG that only carries Apple's PQ profile showed as HDR in Safari, but in a
// Chromium browser the profile appeared to be ignored. A gain map is the more widely
// supported mechanism, and viewers without it fall back to the tone-mapped SDR base.
import CoreImage
import Foundation

let a = CommandLine.arguments
guard let src = CIImage(contentsOf: URL(fileURLWithPath: a[1])) else { fatalError("cannot read \(a[1])") }
let width = a.count > 4 ? CGFloat(Double(a[4])!) : src.extent.width

let linearP3 = CGColorSpace(name: CGColorSpace.extendedLinearDisplayP3)!
let ctx = CIContext(options: [.workingColorSpace: linearP3, .workingFormat: CIFormat.RGBAh])

func peak(_ img: CIImage) -> Float {
    let f = CIFilter(name: "CIAreaMaximum")!
    f.setValue(img, forKey: kCIInputImageKey)
    f.setValue(CIVector(cgRect: img.extent), forKey: kCIInputExtentKey)
    var px = [Float](repeating: 0, count: 4)
    ctx.render(f.outputImage!, toBitmap: &px, rowBytes: 16, bounds: CGRect(x: 0, y: 0, width: 1, height: 1),
               format: .RGBAf, colorSpace: linearP3)
    return max(px[0], px[1], px[2])
}

func scaled(_ img: CIImage) -> CIImage {
    let s = width / img.extent.width
    let f = CIFilter(name: "CILanczosScaleTransform")!
    f.setValue(img, forKey: kCIInputImageKey)
    f.setValue(s, forKey: kCIInputScaleKey)
    f.setValue(1.0, forKey: kCIInputAspectRatioKey)
    return f.outputImage!.cropped(to: CGRect(x: 0, y: 0, width: width.rounded(), height: (img.extent.height * s).rounded()))
}

let hdr = scaled(src)
let headroom = max(peak(hdr), 1)

// SDR base: tone map from the image's own headroom down to SDR (headroom 1).
let tm = CIFilter(name: "CIToneMapHeadroom")!
tm.setValue(hdr, forKey: kCIInputImageKey)
tm.setValue(headroom, forKey: "inputSourceHeadroom")
tm.setValue(1.0, forKey: "inputTargetHeadroom")
let sdr = tm.outputImage!

try ctx.writePNGRepresentation(of: sdr, to: URL(fileURLWithPath: a[2]), format: .RGBA16,
                               colorSpace: CGColorSpace(name: CGColorSpace.displayP3)!)
try ctx.writePNGRepresentation(of: hdr, to: URL(fileURLWithPath: a[3]), format: .RGBA16,
                               colorSpace: CGColorSpace(name: CGColorSpace.displayP3_PQ)!)
print(String(format: "source peak %.2fx SDR white; SDR base peak %.2f", headroom, peak(sdr)))
