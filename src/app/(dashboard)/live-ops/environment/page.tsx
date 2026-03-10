"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StaggerItem } from "@/components/ui/stagger-container";
import { LoadingState } from "@/components/layouts/loading-state";
import { AlertTriangle, CloudSun, Thermometer, Volume2, Zap } from "lucide-react";
import { useEnvironmentalReadings } from "@/lib/supabase/hooks-live-ops";

export default function EnvironmentPage() {
    const { data, isLoading } = useEnvironmentalReadings();

    if (isLoading) return <LoadingState />;

    const rows = data ?? [];
    const latest = rows[0];

    if (!latest) {
        return (
            <div className="space-y-6 animate-fade-in">
                <PageHeader title="Environmental Readings" description="No environmental readings recorded yet" />
            </div>
        );
    }

    const powerUtil = Math.round(((latest.total_power_load_amps ?? 0) / (latest.power_capacity_amps || 1)) * 100);

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Environmental Readings"
                description="Weather, noise, and power monitoring — real-time conditions and alerts"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Temperature"
                    value={`${latest.temperature_f ?? "—"}°F`}
                    icon={Thermometer}
                />
                <StatCard
                    title="Wind"
                    value={`${latest.wind_speed_mph ?? 0} mph (${latest.wind_gusts_mph ?? 0} gusts)`}
                    icon={CloudSun}
                />
                <StatCard title="Noise" value={`${latest.noise_level_db ?? "—"} dB`} icon={Volume2} />
                <StatCard title="Power Load" value={`${powerUtil}%`} icon={Zap} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Weather Conditions</h3>
                        {latest.weather_alert && (
                            <Card className="border-warning/30 bg-warning/5">
                                <CardContent className="py-3 flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                                    <p className="text-sm font-medium text-warning">{latest.weather_alert}</p>
                                </CardContent>
                            </Card>
                        )}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Humidity</span>
                                <span className="font-medium">{latest.humidity_percent}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Wind Speed</span>
                                <span className="font-medium">{latest.wind_speed_mph} mph</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Wind Gusts</span>
                                <span className="font-medium">{latest.wind_gusts_mph} mph</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Weather Alert</span>
                                <span className="font-medium text-success">{latest.weather_alert ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Power Status</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Load</span>
                                <span className="font-medium">
                                    {latest.total_power_load_amps}A / {latest.power_capacity_amps}A
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Utilization</span>
                                <span
                                    className={`font-medium ${powerUtil > 85 ? "text-destructive" : powerUtil > 70 ? "text-warning" : "text-success"}`}
                                >
                                    {powerUtil}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Generator Fuel</span>
                                <span
                                    className={`font-medium ${(latest.generator_fuel_percent ?? 0) < 30 ? "text-destructive" : "text-success"}`}
                                >
                                    {latest.generator_fuel_percent}%
                                </span>
                            </div>
                        </div>
                        <ProgressBar value={powerUtil} size="md" className="mt-3" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="py-4">
                    <h3 className="text-sm font-semibold mb-3">Reading History</h3>
                    <div className="space-y-2">
                        {rows.map((reading, i) => (
                            <StaggerItem key={reading.id} index={i} stagger="tight">
                                <Card className="hover:shadow-sm transition-all">
                                    <CardContent className="py-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono font-bold bg-secondary px-1.5 py-0.5 rounded">
                                                {reading.recorded_at ? new Date(reading.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                                            </span>
                                            {reading.weather_alert && (
                                                <StatusBadge status="warning" className="text-[10px]">
                                                    Alert
                                                </StatusBadge>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">Temp</p>
                                                <p className="font-medium">{reading.temperature_f ?? "—"}°F</p>
                                                <p className="text-[10px] text-muted-foreground">Humidity: {reading.humidity_percent ?? "—"}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">Wind</p>
                                                <p className="font-medium">{reading.wind_speed_mph ?? 0} mph</p>
                                                <p className="text-[10px] text-muted-foreground">Gusts: {reading.wind_gusts_mph ?? 0} mph</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">Noise</p>
                                                <p className="font-medium">{reading.noise_level_db ?? "—"} dB</p>
                                                <p className="text-[10px] text-muted-foreground">{reading.noise_location ?? ""}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">Power</p>
                                                <p className="font-medium">{reading.total_power_load_amps ?? 0}A / {reading.power_capacity_amps ?? 0}A</p>
                                                <ProgressBar
                                                    value={Math.round(((reading.total_power_load_amps ?? 0) / (reading.power_capacity_amps || 1)) * 100)}
                                                    size="xs"
                                                    className="mt-1"
                                                />
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                    Fuel: {reading.generator_fuel_percent ?? "—"}%
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
