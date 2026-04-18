package com.avepha.copyfilepathwithlinenumbers.reference

import kotlin.test.Test
import kotlin.test.assertEquals

class ReferencePathResolverTest {
    @Test
    fun absoluteModeReturnsNormalizedAbsolutePath() {
        assertEquals(
            "/repo/src/File.kt",
            resolveReferencePath(
                documentPath = "\\repo\\src\\File.kt",
                mode = ReferenceMode.ABSOLUTE,
                containingRootPaths = listOf("/repo"),
            ),
        )
    }

    @Test
    fun relativeModeChoosesDeepestContainingRoot() {
        assertEquals(
            "src/App.kt",
            resolveReferencePath(
                documentPath = "/repo/apps/mobile/src/App.kt",
                mode = ReferenceMode.RELATIVE,
                containingRootPaths = listOf("/repo", "/repo/apps/mobile"),
            ),
        )
    }

    @Test
    fun relativeModeFallsBackWhenNoContainingRootsExist() {
        assertEquals(
            "/repo/src/File.kt",
            resolveReferencePath(
                documentPath = "/repo/src/File.kt",
                mode = ReferenceMode.RELATIVE,
                containingRootPaths = emptyList(),
            ),
        )
    }

    @Test
    fun relativeModeFallsBackWhenRootsDoNotMatch() {
        assertEquals(
            "/repo/src/File.kt",
            resolveReferencePath(
                documentPath = "/repo/src/File.kt",
                mode = ReferenceMode.RELATIVE,
                containingRootPaths = listOf("/other-root"),
            ),
        )
    }

    @Test
    fun windowsLikeInputsResolveRelativelyOnNonWindowsHosts() {
        assertEquals(
            "File.kt",
            resolveReferencePath(
                documentPath = "C:\\Users\\Ada\\repo\\pkg\\File.kt",
                mode = ReferenceMode.RELATIVE,
                containingRootPaths = listOf(
                    "C:\\Users\\Ada\\repo",
                    "C:\\Users\\Ada\\repo\\pkg",
                ),
            ),
        )
    }

    @Test
    fun uncPathsNormalizeToPosixSlashes() {
        assertEquals(
            "//server/share/path/File.kt",
            normalizeToPosixPath("\\\\server\\share\\path\\File.kt"),
        )
    }
}
