"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StaggerItem } from "@/components/ui/stagger-container";
import { AlertTriangle, CloudSun, Thermometer, Volume2, Zap } from "lucide-react";
import { useEnvironmentalReadings } from "@/lib/supabase";
import { OperationalDashboardShell } from "@/components/shells/operational-dashboard-shell";
import type { DashboardPageConfig } from "@/types/dashboard-page-config";

type Row = Record<string, unknown>;

const BASE_CONFIG: DashboardPageConfig = {
    resource: "live_ops",
    title: "Environmental Readings",
    description: "Weather, noise, and power monitoring — real-time conditions and alerts",
    emptyState: {
        icon: Thermometer,
        title: "No readings",
        description: "Environmental readings will appear here when recorded.",
    },
};

function computePowerUtil(row: Row): number {
    const load = Number(row.total_power_load_amps) || 0;
    const cap = Number(row.power_capacity_amps) || 1;
    return Math.round((load / cap) * 100);
}

export function EnvironmentPageClient() {
    const { data, isLoading } = useEnvironmentalReadings();
    const rows = useMemo(() => (data ?? []) as Row[], [data]);
    const latest = rows[0] as Row | undefined;

    const config = useMemo<DashboardPageConfig>(() => {
        if (!latest) return BASE_CONFIG;
        const powerUtil = computePowerUtil(latest);
        return {
            ...BASE_CONFIG,
            stats: [
                {
                    label: "Temperature",
                    icon: Thermometer,
                    value: `${latest.temperature_f ?? "—"}°F`,
                },
                {
                    label: "Wind",
                    icon: CloudSun,
                    value: `${latest.wind_speed_mph ?? 0} mph (${latest.wind_gusts_mph ?? 0} gusts)`,
                },
                { label: "Noise", icon: Volume2, value: `${latest.noise_level_db ?? "—"} dB` },
                { label: "Power Load", icon: Zap, value: `${powerUtil}%` },
            ],
            alerts: latest.weather_alert
                ? [
                      {
                          condition: () => true,
                          message: String(latest.weather_alert),
                          severity: "warning" as const,
                          icon: AlertTriangle,
                      },
                  ]
                : [],
        };
    }, [latest]);

    return (
        <OperationalDashboardShell config={config} data={rows} isLoading={isLoading}>
            {latest && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 density-gap-card">
                        <Card>
                            <CardContent className="py-4">
                                <h3 className="text-sm font-semibold mb-3">Weather Conditions</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Humidity</span>
                                        <span className="font-medium">
                                            {latest.humidity_percent as number}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Wind Speed</span>
                                        <span className="font-medium">
                                            {latest.wind_speed_mph as number} mph
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Wind Gusts</span>
                                        <span className="font-medium">
                                            {latest.wind_gusts_mph as number} mph
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Weather Alert</span>
                                        <span className="font-medium text-success">
                                            {latest.weather_alert ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="py-4">
                                <h3 className="text-sm font-semibold mb-3">Power Status</h3>
                                {(() => {
                                    const pu = computePowerUtil(latest);
                                    return (
                                        <>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Load
                                                    </span>
                                                    <span className="font-medium">
                                                        {latest.total_power_load_amps as number}A /{" "}
                                                        {latest.power_capacity_amps as number}A
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Utilization
                                                    </span>
                                                    <span
                                                        className={`font-medium ${pu > 85 ? "text-destructive" : pu > 70 ? "text-warning" : "text-success"}`}
                                                    >
                                                        {pu}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        Generator Fuel
                                                    </span>
                                                    <span
                                                        className={`font-medium ${(Number(latest.generator_fuel_percent) || 0) < 30 ? "text-destructive" : "text-success"}`}
                                                    >
                                                        {latest.generator_fuel_percent as number}%
                                                    </span>
                                                </div>
                                            </div>
                                            <ProgressBar value={pu} size="md" className="mt-3" />
                                        </>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardContent className="py-4">
                            <h3 className="text-sm font-semibold mb-3">Reading History</h3>
                            <div className="space-y-2">
                                {rows.map((reading, i) => {
                                    const rpu = computePowerUtil(reading);
                                    return (
                                        <StaggerItem
                                            key={reading.id as string}
                                            index={i}
                                            stagger="tight"
                                        >
                                            <Card className="hover:shadow-sm transition-all">
                                                <CardContent className="py-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">
                                                            {typeof reading.recorded_at === "string"
                                                                ? new Date(
                                                                      reading.recorded_at
                                                                  ).toLocaleTimeString([], {
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  })
                                                                : "—"}
                                                        </span>
                                                        {Boolean(reading.weather_alert) && (
                                                            <StatusBadge
                                                                status="warning"
                                                                className="density-caption"
                                                            >
                                                                Alert
                                                            </StatusBadge>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                        <div>
                                                            <p className="density-caption text-muted-foreground">
                                                                Temp
                                                            </p>
                                                            <p className="font-medium">
                                                                {(reading.temperature_f as number) ??
                                                                    "—"}
                                                                °F
                                                            </p>
                                                            <p className="density-caption text-muted-foreground">
                                                                Humidity:{" "}
                                                                {(reading.humidity_percent as number) ??
                                                                    "—"}
                                                                %
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="density-caption text-muted-foreground">
                                                                Wind
                                                            </p>
                                                            <p className="font-medium">
                                                                {Number(reading.wind_speed_mph) ||
                                                                    0}{" "}
                                                                mph
                                                            </p>
                                                            <p className="density-caption text-muted-foreground">
                                                                Gusts:{" "}
                                                                {Number(reading.wind_gusts_mph) ||
                                                                    0}{" "}
                                                                mph
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="density-caption text-muted-foreground">
                                                                Noise
                                                            </p>
                                                            <p className="font-medium">
                                                                {(reading.noise_level_db as number) ??
                                                                    "—"}{" "}
                                                                dB
                                                            </p>
                                                            <p className="density-caption text-muted-foreground">
                                                                {(reading.noise_location as string) ??
                                                                    ""}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="density-caption text-muted-foreground">
                                                                Power
                                                            </p>
                                                            <p className="font-medium">
                                                                {Number(
                                                                    reading.total_power_load_amps
                                                                ) || 0}
                                                                A /{" "}
                                                                {Number(
                                                                    reading.power_capacity_amps
                                                                ) || 0}
                                                                A
                                                            </p>
                                                            <ProgressBar
                                                                value={rpu}
                                                                size="xs"
                                                                className="mt-1"
                                                            />
                                                            <p className="density-caption text-muted-foreground mt-0.5">
                                                                Fuel:{" "}
                                                                {(reading.generator_fuel_percent as number) ??
                                                                    "—"}
                                                                %
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </StaggerItem>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </OperationalDashboardShell>
    );
}
