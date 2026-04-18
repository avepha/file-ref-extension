package com.avepha.copyfilepathwithlinenumbers.reference

enum class ReferenceMode {
    ABSOLUTE,
    RELATIVE,
}

private data class ParsedPath(
    val root: String,
    val comparisonRoot: String,
    val segments: List<String>,
)

private fun trimTrailingSlash(value: String): String {
    return if (value.length > 1) value.replace(Regex("/+$"), "") else value
}

private fun isWindowsPath(value: String): Boolean {
    return Regex("^[A-Za-z]:[\\\\/]").containsMatchIn(value) || value.startsWith("\\\\")
}

private fun parsePath(value: String): ParsedPath {
    val normalized = normalizeToPosixPath(value)

    return when {
        normalized.startsWith("//") -> {
            val parts = normalized.removePrefix("//").split('/').filter(String::isNotEmpty)
            val root = if (parts.size >= 2) "//${parts[0]}/${parts[1]}" else "//"
            ParsedPath(
                root = root,
                comparisonRoot = root.lowercase(),
                segments = parts.drop(2),
            )
        }

        Regex("^[A-Za-z]:/").containsMatchIn(normalized) -> {
            val root = normalized.substring(0, 2)
            ParsedPath(
                root = root,
                comparisonRoot = root.lowercase(),
                segments = normalized.substring(2).trimStart('/').split('/').filter(String::isNotEmpty),
            )
        }

        normalized.startsWith("/") -> ParsedPath(
            root = "/",
            comparisonRoot = "/",
            segments = normalized.substring(1).split('/').filter(String::isNotEmpty),
        )

        else -> ParsedPath(
            root = "",
            comparisonRoot = "",
            segments = normalized.split('/').filter(String::isNotEmpty),
        )
    }
}

private fun isContainingFolder(folderPath: String, documentPath: String): Boolean {
    val folder = parsePath(trimTrailingSlash(folderPath))
    val document = parsePath(trimTrailingSlash(documentPath))

    if (folder.comparisonRoot != document.comparisonRoot) {
        return false
    }

    if (folder.segments.size > document.segments.size) {
        return false
    }

    return folder.segments.indices.all { index ->
        val folderSegment = folder.segments[index]
        val documentSegment = document.segments[index]

        if (isWindowsPath(folderPath) || isWindowsPath(documentPath)) {
            folderSegment.equals(documentSegment, ignoreCase = true)
        } else {
            folderSegment == documentSegment
        }
    }
}

private fun relativeFromContainingFolder(folderPath: String, documentPath: String): String {
    val folder = parsePath(trimTrailingSlash(folderPath))
    val document = parsePath(trimTrailingSlash(documentPath))

    if (folder.comparisonRoot != document.comparisonRoot) {
        return ""
    }

    var sharedLength = 0
    while (
        sharedLength < folder.segments.size &&
        sharedLength < document.segments.size &&
        (
            folder.segments[sharedLength] == document.segments[sharedLength] ||
                (
                    isWindowsPath(folderPath) || isWindowsPath(documentPath)
                    ) && folder.segments[sharedLength].equals(document.segments[sharedLength], ignoreCase = true)
            )
    ) {
        sharedLength += 1
    }

    return buildList {
        repeat(folder.segments.size - sharedLength) { add("..") }
        addAll(document.segments.drop(sharedLength))
    }.joinToString("/")
}

fun normalizeToPosixPath(value: String): String {
    return value.replace('\\', '/')
}

fun resolveReferencePath(
    documentPath: String,
    mode: ReferenceMode,
    containingRootPaths: List<String> = emptyList(),
): String {
    val absolutePath = normalizeToPosixPath(documentPath)

    if (mode == ReferenceMode.ABSOLUTE) {
        return absolutePath
    }

    val containingRoot = containingRootPaths
        .filter { root -> isContainingFolder(root, documentPath) }
        .maxByOrNull { normalizeToPosixPath(it).length }
        ?: return absolutePath

    val relativePath = relativeFromContainingFolder(containingRoot, documentPath)
    return if (relativePath.isNotEmpty()) relativePath else absolutePath
}
