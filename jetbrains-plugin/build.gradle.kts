import org.jetbrains.intellij.platform.gradle.IntelliJPlatformType
import org.jetbrains.intellij.platform.gradle.TestFrameworkType

plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm")
    id("org.jetbrains.intellij.platform")
}

group = providers.gradleProperty("pluginGroup").get()
version = providers.gradleProperty("pluginVersion").get()

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

kotlin {
    jvmToolchain(21)
}

val intellijPlatformVersion = providers.gradleProperty("intellijPlatformVersion")
val pluginSinceBuild = providers.gradleProperty("sinceBuild")
val verifierIdeTargets = providers.gradleProperty("verifierIdeTargets")
val publishHost = providers.gradleProperty("publishHost").orElse("https://plugins.jetbrains.com")
val certificateChain = providers.environmentVariable("CERTIFICATE_CHAIN")
val privateKey = providers.environmentVariable("PRIVATE_KEY")
val privateKeyPassword = providers.environmentVariable("PRIVATE_KEY_PASSWORD")
val publishToken = providers.environmentVariable("PUBLISH_TOKEN")

fun parseVerifierTarget(notation: String): Pair<IntelliJPlatformType, String> {
    val parts = notation.split(":", limit = 2)
    require(parts.size == 2) {
        "Invalid verifier target '$notation'. Expected <product>:<version>."
    }

    val type = when (parts[0]) {
        "intellijIdea" -> IntelliJPlatformType.IntellijIdea
        "pycharm" -> IntelliJPlatformType.PyCharm
        "webstorm" -> IntelliJPlatformType.WebStorm
        else -> error("Unsupported verifier target '${parts[0]}'.")
    }

    return type to parts[1]
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("junit:junit:4.13.2")

    intellijPlatform {
        intellijIdea(intellijPlatformVersion)
        pluginVerifier()
        testFramework(TestFrameworkType.Platform)
    }
}

intellijPlatform {
    pluginConfiguration {
        version = providers.gradleProperty("pluginVersion")

        ideaVersion {
            sinceBuild = pluginSinceBuild
            untilBuild.set(provider { null })
        }
    }

    pluginVerification {
        ides {
            create(verifierIdeTargets.map { targets ->
                targets
                    .split(",")
                    .map(String::trim)
                    .filter(String::isNotEmpty)
            }) { notation ->
                val (type, version) = parseVerifierTarget(notation)

                this.type = type
                this.version = version
            }
        }
    }

    signing {
        certificateChain.set(certificateChain)
        privateKey.set(privateKey)
        password.set(privateKeyPassword)
    }

    publishing {
        host.set(publishHost)
        token.set(publishToken)
    }
}

tasks {
    test {
        useJUnit()
    }

    named("signPlugin") {
        onlyIf("JetBrains signing environment variables are configured") {
            certificateChain.isPresent && privateKey.isPresent && privateKeyPassword.isPresent
        }
    }

    named("publishPlugin") {
        onlyIf("PUBLISH_TOKEN is configured") {
            publishToken.isPresent
        }
    }

    register("verifyMarketplaceReady") {
        group = "verification"
        description = "Builds the plugin ZIP and runs the Marketplace readiness checks."
        dependsOn(
            "buildPlugin",
            "verifyPluginProjectConfiguration",
            "verifyPluginStructure",
            "verifyPlugin",
        )
    }

    wrapper {
        gradleVersion = providers.gradleProperty("gradleVersion").get()
        distributionType = Wrapper.DistributionType.BIN
    }
}
