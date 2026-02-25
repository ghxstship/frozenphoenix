"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Thermometer, Wind, Volume2, Zap } from "lucide-react";

interface MockReading {
    id: string;
    recordedAt: string;
    temperatureF: number;
    humidityPercent: number;
    windSpeedMph: number;
    windGustsMph: number;
    noiseLevelDb: number;
    noiseLocation: string;
    totalPowerLoadAmps: number;
    powerCapacityAmps: number;
    generatorFuelPercent: number;
    weatherAlert?: string;
}

const mockReadings: MockReading[] = [
    { id: "1", recordedAt: "2026-02-24T18:00:00Z", temperatureF: 72, humidityPercent: 45, windSpeedMph: 8, windGustsMph: 14, noiseLevelDb: 92, noiseLocation: "Main Stage FOH", totalPowerLoadAmps: 680, powerCapacityAmps: 800, generatorFuelPercent: 78, weatherAlert: undefined },
    { id: "2", recordedAt: "2026-02-24T17:30:00Z", temperatureF: 73, humidityPercent: 44, windSpeedMph: 10, windGustsMph: 16, noiseLevelDb: 85, noiseLocation: "FOH Bar Area", totalPowerLoadAmps: 650, powerCapacityAmps: 800, generatorFuelPercent: 82, weatherAlert: undefined },
    { id: "3", recordedAt: "2026-02-24T17:00:00Z", temperatureF: 74, humidityPercent: 42, windSpeedMph: 7, windGustsMph: 12, noiseLevelDb: 78, noiseLocation: "VIP Lounge", totalPowerLoadAmps: 620, powerCapacityAmps: 800, generatorFuelPercent: 85, weatherAlert: undefined },
];

const latest = mockReadings[0];
const powerUtil = Math.round((latest.totalPowerLoadAmps / latest.powerCapacityAmps) * 100);

export default function EnvironmentPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader title="Environmental Readings" description="Weather, noise, and power monitoring — real-time conditions and alerts" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Temperature" value={`${latest.temperatureF}°F`} icon={Thermometer} />
                <StatCard title="Wind" value={`${latest.windSpeedMph} mph (gusts ${latest.windGustsMph})`} icon={Wind} />
                <StatCard title="Noise Level" value={`${latest.noiseLevelDb} dB`} icon={Volume2} />
                <StatCard title="Power Utilization" value={`${powerUtil}%`} icon={Zap} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Weather Conditions</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span className="font-medium">{latest.temperatureF}°F</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Humidity</span><span className="font-medium">{latest.humidityPercent}%</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Wind Speed</span><span className="font-medium">{latest.windSpeedMph} mph</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Wind Gusts</span><span className="font-medium">{latest.windGustsMph} mph</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Weather Alert</span><span className="font-medium text-success">None</span></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4">
                        <h3 className="text-sm font-semibold mb-3">Power Status</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Load</span><span className="font-medium">{latest.totalPowerLoadAmps}A / {latest.powerCapacityAmps}A</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Utilization</span><span className={`font-medium ${powerUtil > 85 ? "text-destructive" : powerUtil > 70 ? "text-warning" : "text-success"}`}>{powerUtil}%</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Generator Fuel</span><span className={`font-medium ${latest.generatorFuelPercent < 30 ? "text-destructive" : "text-success"}`}>{latest.generatorFuelPercent}%</span></div>
                        </div>
                        <div className="mt-3">
                            <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${powerUtil > 85 ? "bg-destructive" : powerUtil > 70 ? "bg-warning" : "bg-success"}`} style={{ width: `${powerUtil}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="py-4">
                    <h3 className="text-sm font-semibold mb-3">Reading History</h3>
                    <div className="space-y-2">
                        {mockReadings.map((r, i) => (
                            <div key={r.id} className="flex items-center gap-4 text-sm py-2 border-b border-border last:border-0 animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                                <span className="text-xs text-muted-foreground w-20 shrink-0">{new Date(r.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                <span className="w-16">{r.temperatureF}°F</span>
                                <span className="w-20">{r.windSpeedMph} mph</span>
                                <span className="w-16">{r.noiseLevelDb} dB</span>
                                <span className="w-24">{r.totalPowerLoadAmps}A ({Math.round((r.totalPowerLoadAmps / r.powerCapacityAmps) * 100)}%)</span>
                                <span className="w-20">Fuel: {r.generatorFuelPercent}%</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
