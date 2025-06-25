// NetworkInformation API not currently included
// in typescript DOM types
type EffectiveConnectionType = "slow-2g" | "2g" | "3g" | "4g";
type ConnectionType =
    | "bluetooth"
    | "cellular"
    | "ethernet"
    | "none"
    | "wifi"
    | "wimax"
    | "other"
    | "unknown";

interface NetworkInformation extends EventTarget {
    readonly downlink: number;
    readonly downlinkMax: number;
    readonly effectiveType: EffectiveConnectionType;
    readonly rtt: number;
    readonly saveData: boolean;
    readonly type: ConnectionType;
}

export function isSaveDataEnabled(): boolean {
    if ("connection" in window.navigator) {
        const connection = window.navigator.connection as NetworkInformation;
        return connection.saveData;
    }

    return false;
}

export function isSlowConnectionType(): boolean {
    if ("connection" in window.navigator) {
        const connection = window.navigator.connection as NetworkInformation;
        return (
            connection.effectiveType === "slow-2g" ||
            connection.effectiveType === "2g"
        );
    }
    return false;
}
