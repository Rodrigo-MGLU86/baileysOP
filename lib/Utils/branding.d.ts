export interface ResolvedVersions {
    baileysPackage: string;
    baileysVersion: string;
    wrapperPackage: string | null;
    wrapperVersion: string | null;
    wrapperLatest: string | null;
    libsignalVersion: string | null;
}
export interface VersionUpdateInfo {
    current: string;
    latest: string;
    hasUpdate: boolean;
    source?: "npm" | "github";
}
export interface QrBrandingResult {
    headerLines: string[];
    footerLines: string[];
    versions: ResolvedVersions;
    update: VersionUpdateInfo | null;
}
export declare const getResolvedVersions: () => ResolvedVersions;
export declare const getBaileysUpdateInfo: () => Promise<VersionUpdateInfo | null>;
export declare const getQrBranding: () => Promise<QrBrandingResult>;
export declare const writeBrandingLines: (lines: string[], logger?: any) => void;
