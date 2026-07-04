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
    // Target Java 17 bytecode so the plugin loads on every IDE from 2022.2 (JBR 17)
    // through the latest (JBR 21 runs 17 bytecode). The JDK 21 toolchain is only used
    // to compile against the newer platform SDK and to launch IDE-based Gradle tasks.
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    jvmToolchain(21)
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
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
        "intellijIdeaCommunity" -> IntelliJPlatformType.IntellijIdeaCommunity
        "androidStudio" -> IntelliJPlatformType.AndroidStudio
        "pycharm" -> IntelliJPlatformType.PyCharm
        "pycharmCommunity" -> IntelliJPlatformType.PyCharmCommunity
        "webstorm" -> IntelliJPlatformType.WebStorm
        "goland" -> IntelliJPlatformType.GoLand
        "rider" -> IntelliJPlatformType.Rider
        "clion" -> IntelliJPlatformType.CLion
        "rubymine" -> IntelliJPlatformType.RubyMine
        "phpstorm" -> IntelliJPlatformType.PhpStorm
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
