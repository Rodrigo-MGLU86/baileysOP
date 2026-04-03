export interface VersionInfo {
    current: string;
    latest: string;
    hasUpdate: boolean;
    source?: "npm" | "github";
}
export interface VersionCheckOptions {
    timeoutMs?: number;
    githubRepo?: string;
}
/**
 * Check if a new version is available (npm first, optional GitHub fallback).
 */
export declare const checkNpmVersion: (
    packageName: string,
    currentVersion: string,
    options?: VersionCheckOptions
) => Promise<VersionInfo | null>;
