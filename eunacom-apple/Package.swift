// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "EUNACOM",
    defaultLocalization: "es",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .visionOS(.v1)
    ],
    products: [
        .library(
            name: "EUNACOMCore",
            targets: ["EUNACOMCore"]
        ),
        .executable(
            name: "EUNACOMApp",
            targets: ["EUNACOMApp"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "EUNACOMCore",
            dependencies: [],
            path: "Sources/Core",
            resources: [
                .process("Resources")
            ]
        ),
        .executableTarget(
            name: "EUNACOMApp",
            dependencies: ["EUNACOMCore"],
            path: "Sources/App"
        ),
        .testTarget(
            name: "EUNACOMTests",
            dependencies: ["EUNACOMCore"],
            path: "Tests/EUNACOMTests"
        )
    ]
)
