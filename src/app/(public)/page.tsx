"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OverlineText } from "@/components/ui/overline-text";
import { MOCK_CASE_STUDIES } from "@/lib/demo-data";
import { useCreateLead, usePublicTestimonials, useReviewStats } from "@/lib/supabase/hooks-crm";
import { brandConfig } from "@/config/brand";
import { StaggerItem } from "@/components/ui/stagger-container";
import {
    Flame,
    CheckCircle2,
    Star,
    Send,
    Zap,
    Shield,
    BarChart3,
    Palette,
    Package,
    Loader2,
} from "lucide-react";

export default function LandingPage() {
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        projectType: "",
        budgetRange: "",
    });
    const [submitted, setSubmitted] = useState(false);
    
    const createLead = useCreateLead();
    const { data: testimonials } = usePublicTestimonials();
    const { data: reviewStats } = useReviewStats();

    const handleSubmit = async () => {
        const [firstName, ...lastParts] = formData.name.split(" ");
        const lastName = lastParts.join(" ") || undefined;
        
        try {
            await createLead.mutateAsync({
                first_name: firstName,
                last_name: lastName,
                email: formData.email,
                company: formData.company || undefined,
                project_type: (formData.projectType || undefined) as "brand_activation" | "stage_set_design" | "immersive_installation" | "trade_show_expo" | "pop_up_retail" | "festival_production" | "corporate_event" | "product_launch" | "other" | undefined,
                budget_range: (formData.budgetRange || undefined) as "under_50k" | "50k_150k" | "150k_500k" | "500k_1m" | "1m_5m" | "over_5m" | undefined,
                source: "website",
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit lead:", error);
            setSubmitted(true);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Flame className="h-4.5 w-4.5 text-primary-foreground" />
                        </div>
                        <span className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {brandConfig.name}
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm">
                        <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
                        <a href="#work" className="text-muted-foreground hover:text-foreground transition-colors">Work</a>
                        <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
                    </div>
                    <Button size="sm" asChild>
                        <a href="/dashboard">Client Portal</a>
                    </Button>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Gradient orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs">
                        <Zap className="h-3 w-3 mr-1" /> Experiential Production, Reimagined
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                        We Build
                        <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"> Unforgettable </span>
                        Experiences
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        From concept to load-out, we architect and fabricate world-class brand activations, stages, and immersive environments for the world&apos;s most ambitious brands.
                    </p>

                    {/* Lead Capture */}
                    <div id="contact" className="max-w-md mx-auto">
                        {submitted ? (
                            <div className="spatial-card p-6 text-center animate-scale-in">
                                <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
                                <p className="font-semibold">We&apos;ll be in touch!</p>
                                <p className="text-sm text-muted-foreground mt-1">Expect a response within 24 hours.</p>
                            </div>
                        ) : (
                            <div className="spatial-card p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input 
                                        placeholder="Your name" 
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                    <Input 
                                        placeholder="Company" 
                                        value={formData.company}
                                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                                    />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <select 
                                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm text-muted-foreground"
                                    value={formData.projectType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
                                >
                                    <option value="">Project Type</option>
                                    <option value="brand_activation">Brand Activation</option>
                                    <option value="stage_set_design">Stage & Set Design</option>
                                    <option value="immersive_installation">Immersive Installation</option>
                                    <option value="trade_show_expo">Trade Show / Expo</option>
                                    <option value="pop_up_retail">Pop-Up Retail</option>
                                    <option value="festival_production">Festival Production</option>
                                </select>
                                <select 
                                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm text-muted-foreground"
                                    value={formData.budgetRange}
                                    onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                                >
                                    <option value="">Budget Range</option>
                                    <option value="50k_150k">$50K — $150K</option>
                                    <option value="150k_500k">$150K — $500K</option>
                                    <option value="500k_1m">$500K — $1M</option>
                                    <option value="1m_5m">$1M — $5M</option>
                                    <option value="over_5m">$5M+</option>
                                </select>
                                <Button 
                                    className="w-full" 
                                    size="lg" 
                                    onClick={handleSubmit}
                                    disabled={createLead.isPending || !formData.name || !formData.email}
                                >
                                    {createLead.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    {createLead.isPending ? "Submitting..." : "Start Your Project"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section id="services" className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">Full-Spectrum Production</h2>
                        <p className="text-muted-foreground">Every phase, every detail, under one roof.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Palette, title: "Creative Design", desc: "Concept development, 3D renders, and client presentations powered by live project data." },
                            { icon: Package, title: "Fabrication", desc: "Steel, wood, print — precision fabrication with real-time progress tracking." },
                            { icon: BarChart3, title: "Production Management", desc: "Gantt scheduling across 7 phases with dependency tracking and crew coordination." },
                            { icon: Shield, title: "Compliance & Safety", desc: "OSHA certification tracking, COI validation, and zero-trust access control." },
                            { icon: Zap, title: "Live Activation", desc: "Run-of-show management, real-time crew dispatch, and on-site problem solving." },
                            { icon: Star, title: "Case Studies", desc: "Auto-generated project case studies with KPI metrics, published with one click." },
                        ].map((service, i) => (
                            <StaggerItem key={service.title} index={i} stagger="relaxed">
                            <div
                                className="spatial-card p-6 group cursor-pointer"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <service.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-base font-bold mb-2">{service.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                            </div>
                            </StaggerItem>
                        ))}
                    </div>
                </div>
            </section>

            {/* Case Studies */}
            <section id="work" className="py-20 px-6 bg-secondary/30">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">Selected Work</h2>
                        <p className="text-muted-foreground">Auto-generated from completed productions.</p>
                    </div>
                    {MOCK_CASE_STUDIES.map((cs) => (
                        <div key={cs.id} className="spatial-card p-8 max-w-3xl mx-auto">
                            <Badge variant="info" className="mb-4">{cs.client}</Badge>
                            <h3 className="text-2xl font-bold mb-3">{cs.title}</h3>
                            <p className="text-muted-foreground leading-relaxed mb-6">{cs.summary}</p>
                            <div className="flex flex-wrap gap-4">
                                {cs.metrics.map((metric) => (
                                    <div key={metric.label} className="px-4 py-2 rounded-xl bg-secondary">
                                        <p className="text-xl font-bold">{metric.value}</p>
                                        <OverlineText>{metric.label}</OverlineText>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            {testimonials && testimonials.length > 0 && (
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-14">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                {reviewStats && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-5 w-5 ${i < Math.round(reviewStats.average_rating || 4.8) ? "text-star-rating fill-star-rating" : "text-muted"}`} />
                                            ))}
                                        </div>
                                        <span className="text-lg font-bold">{reviewStats.average_rating || "4.8"}</span>
                                        <span className="text-muted-foreground">({reviewStats.total_reviews || testimonials.length} reviews)</span>
                                    </>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold mb-3">What Our Clients Say</h2>
                            <p className="text-muted-foreground">Real feedback from real productions.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.slice(0, 3).map((testimonial) => (
                                <div key={testimonial.id} className="spatial-card p-6">
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < (testimonial.rating || 5) ? "text-star-rating fill-star-rating" : "text-muted"}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm leading-relaxed mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-bold text-primary">
                                                {testimonial.author_name.split(" ").map((n: string) => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{testimonial.author_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {testimonial.author_title}{testimonial.author_company && `, ${testimonial.author_company}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-10 px-6 border-t border-border">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">{brandConfig.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {brandConfig.name}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
