"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBrandingLines = exports.getQrBranding = exports.getBaileysUpdateInfo = exports.getResolvedVersions = void 0;

const fs = require("fs");
const path = require("path");
const { checkNpmVersion } = require("./check-npm-version");

const BRAND = Object.freeze({
  name: "Neelify",
  headerClaim: "Die offizielle Neelify QR Experience",
  footerClaim: "Built for the best WhatsApp Web experience",
  footerTagline: "Ein QR, ein Stil, klarer Start"
});

const ANSI = Object.freeze({
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m"
});

const color = (value, ansiColor) => `${ansiColor}${value}${ANSI.reset}`;

let packageMetaCache = null;
let updateCheckPromise = null;
let updateInfoCache = null;
let hasShownBaileysUpdateHint = false;
let hasShownWrapperUpdateHint = false;

const readJson = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (_error) {
    return null;
  }
};

const readBaileysMeta = () => {
  if (packageMetaCache) {
    return packageMetaCache;
  }

  const filePath = path.join(__dirname, "..", "..", "package.json");
  const parsed = readJson(filePath) || {};

  packageMetaCache = {
    name: parsed.name || "@neelify/baileys",
    version: parsed.version || process.env.npm_package_version || "0.0.0"
  };

  return packageMetaCache;
};

const safeRequireVersion = (pkg) => {
  try {
    const resolved = require.resolve(`${pkg}/package.json`, { paths: [process.cwd(), __dirname] });
    const parsed = readJson(resolved);
    return parsed?.version ? String(parsed.version) : null;
  } catch (_error) {
    return null;
  }
};

const getResolvedVersions = () => {
  const meta = readBaileysMeta();
  const wrapperPackage = process.env.NEELIFY_WRAPPER_PACKAGE || "";
  const wrapperVersion = process.env.NEELIFY_WRAPPER_VERSION || "";
  const libsignalVersion = safeRequireVersion("@neelify/libsignal") || "";

  return {
    baileysPackage: meta.name,
    baileysVersion: meta.version,
    wrapperPackage: wrapperPackage || null,
    wrapperVersion: wrapperVersion || null,
    wrapperLatest: process.env.NEELIFY_WRAPPER_UPDATE || null,
    libsignalVersion: libsignalVersion || null
  };
};

exports.getResolvedVersions = getResolvedVersions;

const getBaileysUpdateInfo = async () => {
  if (updateInfoCache) {
    return updateInfoCache;
  }

  if (!updateCheckPromise) {
    const { baileysPackage, baileysVersion } = getResolvedVersions();
    updateCheckPromise = checkNpmVersion(baileysPackage, baileysVersion, {
      githubRepo: "neelify/baileys",
      timeoutMs: 5000
    }).catch(() => null);
  }

  updateInfoCache = await updateCheckPromise;
  return updateInfoCache;
};

exports.getBaileysUpdateInfo = getBaileysUpdateInfo;

const buildDivider = () => color("============================================================", ANSI.gray);

const BOX_WIDTH = 64;

const visibleLength = (value = "") => String(value || "").replace(/\x1B\[[0-9;]*m/g, "").length;

const centerText = (text, width = BOX_WIDTH) => {
  const normalized = String(text || "");
  const innerWidth = Math.max(0, width - 2);
  const textLength = visibleLength(normalized);
  const left = Math.max(0, Math.floor((innerWidth - textLength) / 2));
  const right = Math.max(0, innerWidth - textLength - left);
  return `║${" ".repeat(left)}${normalized}${" ".repeat(right)}║`;
};

const getQrBranding = async () => {
  const versions = getResolvedVersions();
  const update = await getBaileysUpdateInfo();
  const shouldShowBaileysUpdateHint = Boolean(update?.hasUpdate) && !hasShownBaileysUpdateHint;
  const shouldShowWrapperUpdateHint =
    Boolean(versions.wrapperPackage && versions.wrapperLatest) && !hasShownWrapperUpdateHint;

  const headerLines = [
    color(`╔${"═".repeat(BOX_WIDTH)}╗`, ANSI.magenta),
    color(centerText(`🌸 OFFIZIELLE @NEELIFY/BAILEYS VERSION ${versions.baileysVersion} 🌸`, BOX_WIDTH), ANSI.magenta),
    versions.wrapperPackage && versions.wrapperVersion
      ? color(centerText(`🦋 ${versions.wrapperPackage} v${versions.wrapperVersion} 🦋`, BOX_WIDTH), ANSI.cyan)
      : color(centerText(`✨ ${BRAND.headerClaim} ✨`, BOX_WIDTH), ANSI.cyan),
    versions.libsignalVersion
      ? color(centerText(`🔐 @neelify/libsignal v${versions.libsignalVersion}`, BOX_WIDTH), ANSI.cyan)
      : color(centerText(`✨ ${BRAND.headerClaim} ✨`, BOX_WIDTH), ANSI.cyan),
    color(`╠${"═".repeat(BOX_WIDTH)}╣`, ANSI.magenta),
    color(centerText('✨ ｡☆✼★━━━━━━━━━━━━★✼☆｡ ✨', BOX_WIDTH), ANSI.yellow),
    color(centerText('📱 Neuer QR-Code erhalten', BOX_WIDTH), ANSI.cyan),
    color(centerText(`Powered by ${BRAND.name}`, BOX_WIDTH), ANSI.cyan),
    color(`╚${"═".repeat(BOX_WIDTH)}╝`, ANSI.magenta),
    color(`╔${"═".repeat(BOX_WIDTH)}╗`, ANSI.magenta),
    color(centerText('💖 Scanne den QR-Code mit WhatsApp 💖', BOX_WIDTH), ANSI.yellow),
    color(`╚${"═".repeat(BOX_WIDTH)}╝`, ANSI.magenta)
  ].filter(Boolean);

  if (shouldShowBaileysUpdateHint) {
    const source = update.source || "npm";
    headerLines.splice(headerLines.length - 4, 0,
      color(centerText(`⬆ Update verfuegbar: ${update.latest} via ${source}`, BOX_WIDTH), ANSI.yellow)
    );
  }

  if (shouldShowWrapperUpdateHint) {
    headerLines.splice(headerLines.length - 4, 0,
      color(centerText(`⬆ Wrapper-Update: ${versions.wrapperLatest}`, BOX_WIDTH), ANSI.yellow)
    );
  }

  const footerLines = [
    color(`╔${"═".repeat(BOX_WIDTH)}╗`, ANSI.magenta),
    color(centerText(`🌸 ${BRAND.footerClaim} 🌸`, BOX_WIDTH), ANSI.magenta),
    color(centerText(BRAND.footerTagline, BOX_WIDTH), ANSI.cyan),
    color(centerText('💡 Es wird immer nur der aktuellste QR genutzt 💡', BOX_WIDTH), ANSI.yellow),
    color(`╚${"═".repeat(BOX_WIDTH)}╝`, ANSI.magenta)
  ];

  if (shouldShowBaileysUpdateHint) {
    hasShownBaileysUpdateHint = true;
  }
  if (shouldShowWrapperUpdateHint) {
    hasShownWrapperUpdateHint = true;
  }

  return {
    headerLines,
    footerLines,
    versions,
    update
  };
};

exports.getQrBranding = getQrBranding;

const writeBrandingLines = (lines, logger) => {
  if (!Array.isArray(lines) || !lines.length) {
    return;
  }

  for (const line of lines) {
    if (!line) continue;

    if (logger && typeof logger.info === "function" && logger.level && logger.level !== "silent") {
      logger.info(line);
      continue;
    }

    console.log(line);
  }
};

exports.writeBrandingLines = writeBrandingLines;
