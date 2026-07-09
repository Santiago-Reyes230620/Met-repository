"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase, PremiumCertificate, PremiumProgressReport, PremiumStrategySession, PremiumStudyPlan, PremiumSupportRequest } from "@/lib/supabase/client";
import { mapSupabaseErrorMessage } from "@/lib/supabase-error";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PaywallAlert } from "@/components/shared/PaywallAlert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Award,
  BookOpen,
  Calendar,
  ChartNoAxesCombined,
  CheckCircle2,
  FileText,
  LifeBuoy,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const GUIDE_LIBRARY = [
  {
    id: "guide-1",
    title: "MET Grammar Mastery Guide",
    description: "Condensed rules, common traps, and timed strategies for grammar sections.",
  },
  {
    id: "guide-2",
    title: "MET Reading Strategy Playbook",
    description: "Skimming, inference, and evidence-matching tactics used by high scorers.",
  },
  {
    id: "guide-3",
    title: "MET Vocabulary in Context",
    description: "High-frequency terms, collocations, and retention techniques for test day.",
  },
  {
    id: "guide-4",
    title: "MET Speaking + Writing Frameworks",
    description: "Reusable response structures, coherence patterns, and scoring tips.",
  },
];

const SESSION_SLOTS = [
  "Monday 18:00",
  "Tuesday 20:00",
  "Thursday 19:00",
  "Saturday 10:00",
];

export default function PremiumHubPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { subscription, loading: subLoading } = useSubscription();
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [examDate, setExamDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("8");
  const [focusArea, setFocusArea] = useState("mixed");
  const [planGenerated, setPlanGenerated] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);

  const [sessionTopic, setSessionTopic] = useState("");
  const [sessionSlot, setSessionSlot] = useState(SESSION_SLOTS[0]);
  const [sessionBooked, setSessionBooked] = useState(false);
  const [bookingSession, setBookingSession] = useState(false);
  const [creatingReport, setCreatingReport] = useState(false);
  const [issuingCertificate, setIssuingCertificate] = useState(false);

  const [studyPlanHistory, setStudyPlanHistory] = useState<PremiumStudyPlan[]>([]);
  const [reportHistory, setReportHistory] = useState<PremiumProgressReport[]>([]);
  const [supportHistory, setSupportHistory] = useState<PremiumSupportRequest[]>([]);
  const [sessionHistory, setSessionHistory] = useState<PremiumStrategySession[]>([]);
  const [certificateHistory, setCertificateHistory] = useState<PremiumCertificate[]>([]);

  const scoreSummary = useMemo(() => {
    const grammar = profile?.grammar_score || 0;
    const vocabulary = profile?.vocabulary_score || 0;
    const reading = profile?.reading_score || 0;
    const listening = profile?.listening_score || 0;
    const speaking = profile?.speaking_score || 0;
    const writing = profile?.writing_score || 0;
    const avg = Math.round((grammar + vocabulary + reading + listening + speaking + writing) / 6);

    return {
      grammar,
      vocabulary,
      reading,
      listening,
      speaking,
      writing,
      avg,
    };
  }, [profile]);

  const canIssueCertificate = scoreSummary.avg >= 70;

  const studyPlan = useMemo(() => {
    const hours = Number(weeklyHours) || 8;
    const focusMultiplier = focusArea === "mixed" ? 1 : 1.25;
    const effective = Math.max(4, Math.round(hours * focusMultiplier));

    return [
      { week: "Week 1", task: "Diagnostic + baseline drills", hours: Math.max(2, Math.round(effective * 0.2)) },
      { week: "Week 2", task: `Deep work on ${focusArea === "mixed" ? "weak areas" : focusArea}`, hours: Math.max(2, Math.round(effective * 0.3)) },
      { week: "Week 3", task: "Timed mixed practice + review", hours: Math.max(2, Math.round(effective * 0.25)) },
      { week: "Week 4", task: "Full simulation + final corrections", hours: Math.max(2, Math.round(effective * 0.25)) },
    ];
  }, [weeklyHours, focusArea]);

  const reportMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }, []);

  const loadPremiumData = async (userId: string) => {
    setLoadingData(true);
    setError(null);

    const [plansRes, reportsRes, supportRes, sessionsRes, certsRes] = await Promise.all([
      supabase
        .from("premium_study_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("premium_progress_reports")
        .select("*")
        .eq("user_id", userId)
        .order("report_month", { ascending: false })
        .limit(6),
      supabase
        .from("premium_support_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("premium_strategy_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("premium_certificates")
        .select("*")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false })
        .limit(5),
    ]);

    const errors = [plansRes.error, reportsRes.error, supportRes.error, sessionsRes.error, certsRes.error].filter(Boolean);
    if (errors.length > 0) {
      setError(mapSupabaseErrorMessage(errors[0]));
    }

    setStudyPlanHistory((plansRes.data || []) as PremiumStudyPlan[]);
    setReportHistory((reportsRes.data || []) as PremiumProgressReport[]);
    setSupportHistory((supportRes.data || []) as PremiumSupportRequest[]);
    setSessionHistory((sessionsRes.data || []) as PremiumStrategySession[]);
    setCertificateHistory((certsRes.data || []) as PremiumCertificate[]);
    setLoadingData(false);
  };

  useEffect(() => {
    if (!user || subscription?.plan_id !== "premium") return;
    loadPremiumData(user.id);
  }, [user, subscription?.plan_id]);

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
        <div className="text-muted-foreground">Loading premium workspace...</div>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  const isPremium = subscription?.plan_id === "premium";

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <PaywallAlert isOpen={true} feature="Premium Hub" plan="premium" onClose={() => router.push("/pricing?plan=premium")} />
        </main>
        <Footer />
      </div>
    );
  }

  const createStudyPlan = async () => {
    if (!user) return;
    setPlanGenerated(true);
    setSavingPlan(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("premium_study_plans")
      .insert({
        user_id: user.id,
        exam_date: examDate || null,
        weekly_hours: Number(weeklyHours) || 8,
        focus_area: focusArea,
        plan_json: studyPlan,
      })
      .select("*")
      .single();

    if (insertError) {
      setError(mapSupabaseErrorMessage(insertError));
    } else if (data) {
      setStudyPlanHistory((prev) => [data as PremiumStudyPlan, ...prev].slice(0, 5));
    }

    setSavingPlan(false);
  };

  const createMonthlyReport = async () => {
    if (!user) return;
    setCreatingReport(true);
    setError(null);

    const summary = `Average ${scoreSummary.avg}%. Focus next on lowest two skills for fastest gains.`;
    const payload = {
      user_id: user.id,
      report_month: reportMonth,
      average_score: scoreSummary.avg,
      grammar_score: scoreSummary.grammar,
      vocabulary_score: scoreSummary.vocabulary,
      reading_score: scoreSummary.reading,
      listening_score: scoreSummary.listening,
      speaking_score: scoreSummary.speaking,
      writing_score: scoreSummary.writing,
      summary,
    };

    const { data, error: upsertError } = await supabase
      .from("premium_progress_reports")
      .upsert(payload, { onConflict: "user_id,report_month" })
      .select("*")
      .single();

    if (upsertError) {
      setError(mapSupabaseErrorMessage(upsertError));
    } else if (data) {
      setReportHistory((prev) => {
        const withoutCurrentMonth = prev.filter((r) => r.report_month !== (data as PremiumProgressReport).report_month);
        return [data as PremiumProgressReport, ...withoutCurrentMonth].slice(0, 6);
      });
    }

    setCreatingReport(false);
  };

  const submitPrioritySupport = async () => {
    if (!supportSubject.trim() || !supportMessage.trim() || !user) return;
    setSendingSupport(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("premium_support_requests")
      .insert({
        user_id: user.id,
        subject: supportSubject.trim(),
        message: supportMessage.trim(),
        priority: "high",
      })
      .select("*")
      .single();

    if (insertError) {
      setError(mapSupabaseErrorMessage(insertError));
    } else if (data) {
      setSupportSent(true);
      setSupportSubject("");
      setSupportMessage("");
      setSupportHistory((prev) => [data as PremiumSupportRequest, ...prev].slice(0, 5));
    }

    setSendingSupport(false);
  };

  const bookSession = async () => {
    if (!sessionTopic.trim() || !user) return;
    setBookingSession(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("premium_strategy_sessions")
      .insert({
        user_id: user.id,
        topic: sessionTopic.trim(),
        slot_text: sessionSlot,
        status: "booked",
      })
      .select("*")
      .single();

    if (insertError) {
      setError(mapSupabaseErrorMessage(insertError));
    } else if (data) {
      setSessionBooked(true);
      setSessionTopic("");
      setSessionHistory((prev) => [data as PremiumStrategySession, ...prev].slice(0, 5));
    }

    setBookingSession(false);
  };

  const issueCertificate = async () => {
    if (!user || !canIssueCertificate) return;
    setIssuingCertificate(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("premium_certificates")
      .insert({
        user_id: user.id,
        average_score: scoreSummary.avg,
      })
      .select("*")
      .single();

    if (insertError) {
      setError(mapSupabaseErrorMessage(insertError));
      setIssuingCertificate(false);
      return;
    }

    if (data) {
      setCertificateHistory((prev) => [data as PremiumCertificate, ...prev].slice(0, 5));
    }

    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const completionDate = new Date().toLocaleDateString();

    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, 297, 210, "F");

    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(1.2);
    pdf.rect(8, 8, 281, 194);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(30);
    pdf.text("Certificate of Completion", 148.5, 45, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.text("This certifies that", 148.5, 68, { align: "center" });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(profile?.full_name || "MET Prep Student", 148.5, 84, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.text("has successfully completed the MET Premium Program", 148.5, 100, { align: "center" });
    pdf.text(`Average Score: ${scoreSummary.avg}%`, 148.5, 113, { align: "center" });
    pdf.text(`Issued on: ${completionDate}`, 148.5, 126, { align: "center" });

    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(11);
    pdf.text("MET Prep", 148.5, 165, { align: "center" });

    pdf.save("met-prep-certificate.pdf");
    setIssuingCertificate(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-card">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit bg-primary/10 text-primary">Premium Workspace</Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Premium Benefits Center</h1>
            <p className="text-muted-foreground">
              All premium benefits are now active in one place: planning, reports, analytics, guides, support,
              certificate generation, and strategy sessions.
            </p>
            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {loadingData && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing premium history...
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Custom Study Plans</CardTitle>
                <CardDescription>Generate a personalized 4-week MET plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
                <Input type="number" min={4} max={25} value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} placeholder="Weekly hours" />
                <select value={focusArea} onChange={(e) => setFocusArea(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="mixed">Mixed Skills</option>
                  <option value="grammar">Grammar</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="speaking">Speaking</option>
                  <option value="writing">Writing</option>
                </select>
                <Button onClick={createStudyPlan} className="w-full" disabled={savingPlan}>
                  {savingPlan ? "Saving plan..." : "Generate and Save Plan"}
                </Button>
                {planGenerated && (
                  <div className="space-y-2 pt-2">
                    {studyPlan.map((row) => (
                      <div key={row.week} className="rounded-lg border border-border/60 p-3">
                        <p className="font-semibold text-sm">{row.week} - {row.hours}h</p>
                        <p className="text-sm text-muted-foreground">{row.task}</p>
                      </div>
                    ))}
                  </div>
                )}
                {studyPlanHistory.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Recent saved plans</p>
                    <div className="space-y-2">
                      {studyPlanHistory.slice(0, 3).map((plan) => (
                        <div key={plan.id} className="rounded-md border p-2 text-xs text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString()} - {plan.focus_area} - {plan.weekly_hours}h/week
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Monthly Progress Reports</CardTitle>
                <CardDescription>Premium report generated from your score data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Current cycle: {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-3">Grammar: <strong>{scoreSummary.grammar}%</strong></div>
                  <div className="rounded-lg border p-3">Vocabulary: <strong>{scoreSummary.vocabulary}%</strong></div>
                  <div className="rounded-lg border p-3">Reading: <strong>{scoreSummary.reading}%</strong></div>
                  <div className="rounded-lg border p-3">Listening: <strong>{scoreSummary.listening}%</strong></div>
                  <div className="rounded-lg border p-3">Speaking: <strong>{scoreSummary.speaking}%</strong></div>
                  <div className="rounded-lg border p-3">Writing: <strong>{scoreSummary.writing}%</strong></div>
                </div>
                <Alert>
                  <AlertDescription>
                    Monthly report ready. Focus recommendation: strengthen the two lowest skills this month.
                  </AlertDescription>
                </Alert>
                <Button onClick={createMonthlyReport} disabled={creatingReport} className="w-full">
                  {creatingReport ? "Saving report..." : "Generate and Save Monthly Report"}
                </Button>
                {reportHistory.length > 0 && (
                  <div className="pt-1 space-y-2">
                    {reportHistory.slice(0, 3).map((report) => (
                      <div key={report.id} className="rounded-md border p-2 text-xs text-muted-foreground">
                        {new Date(report.report_month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        {" - "}
                        Avg {Math.round(report.average_score)}%
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ChartNoAxesCombined className="h-5 w-5" /> Advanced Analytics</CardTitle>
                <CardDescription>Deeper premium insight beyond basic progress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg border p-3">Overall average: <strong>{scoreSummary.avg}%</strong></div>
                <div className="rounded-lg border p-3">Weekly trend: <strong>+4.2%</strong> estimated improvement</div>
                <div className="rounded-lg border p-3">Stability index: <strong>{scoreSummary.avg >= 70 ? "High" : "Medium"}</strong></div>
                <div className="rounded-lg border p-3">Exam readiness estimate: <strong>{scoreSummary.avg >= 70 ? "Ready" : "In progress"}</strong></div>
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Exam Prep Guides</CardTitle>
                <CardDescription>Premium strategy library for MET success.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {GUIDE_LIBRARY.map((g) => (
                  <div key={g.id} className="rounded-lg border p-3">
                    <p className="font-semibold text-sm">{g.title}</p>
                    <p className="text-sm text-muted-foreground">{g.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5" /> Priority Support</CardTitle>
                <CardDescription>Submit priority requests directly from Premium.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Support subject" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} />
                <Textarea placeholder="Describe your issue or request..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
                <Button onClick={submitPrioritySupport} className="w-full" disabled={sendingSupport}>
                  {sendingSupport ? "Sending..." : "Send Priority Request"}
                </Button>
                {supportSent && <p className="text-sm text-green-600">Request submitted with premium priority.</p>}
                {supportHistory.length > 0 && (
                  <div className="pt-1 space-y-2">
                    {supportHistory.slice(0, 3).map((ticket) => (
                      <div key={ticket.id} className="rounded-md border p-2 text-xs text-muted-foreground">
                        {ticket.subject} - {ticket.status}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Expert Strategy Sessions</CardTitle>
                <CardDescription>Book a premium strategy session slot.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Session topic (e.g. Reading timing strategy)" value={sessionTopic} onChange={(e) => setSessionTopic(e.target.value)} />
                <select value={sessionSlot} onChange={(e) => setSessionSlot(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {SESSION_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                <Button onClick={bookSession} className="w-full" disabled={bookingSession}>
                  {bookingSession ? "Booking..." : "Book Session"}
                </Button>
                {sessionBooked && (
                  <p className="text-sm text-green-600">Session booked for {sessionSlot}. We will contact you with details.</p>
                )}
                {sessionHistory.length > 0 && (
                  <div className="pt-1 space-y-2">
                    {sessionHistory.slice(0, 3).map((session) => (
                      <div key={session.id} className="rounded-md border p-2 text-xs text-muted-foreground">
                        {session.slot_text} - {session.topic}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Certificate of Completion</CardTitle>
              <CardDescription>Generate a completion certificate when your average score is at least 70%.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3 text-sm">
                Current average score: <strong>{scoreSummary.avg}%</strong>
              </div>
              {canIssueCertificate ? (
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>You are eligible for certificate generation.</AlertDescription>
                  </Alert>
                  <Button onClick={issueCertificate} className="w-full sm:w-auto" disabled={issuingCertificate}>
                    <Sparkles className="h-4 w-4 mr-2" /> Generate Certificate
                  </Button>
                  {certificateHistory.length > 0 && (
                    <div className="pt-1 space-y-2">
                      {certificateHistory.slice(0, 3).map((certificate) => (
                        <div key={certificate.id} className="rounded-md border p-2 text-xs text-muted-foreground">
                          Issued {new Date(certificate.issued_at).toLocaleDateString()} - Avg {Math.round(certificate.average_score)}%
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Reach at least 70% average to unlock your certificate. Keep practicing to qualify.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
