"use client";

import { Layout } from "@/components/layout/Layout";
import { AIConfidenceBadge } from "@/components/ui/AIConfidenceBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockScholarshipApplicants,
  mockCommitteeScores,
} from "@/data/mockData";
import { useAppStore } from "@/store/appStore";
import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldAlert,
  Star,
  Users,
  Zap,
  Lock,
  Trophy,
  History,
  ClipboardCheck,
} from "lucide-react";
import { useState, useEffect } from "react";

const RUBRIC_DESCRIPTIONS: Record<string, { range: string; label: string; desc: string }[]> = {
  need: [
    { range: "1-2", label: "Low Need", desc: "Full tuition coverage already applies. No hardship stated or FAFSA EFC is high." },
    { range: "3-4", label: "Moderate Need", desc: "Pays minor out-of-pocket costs. Standard curriculum fees apply." },
    { range: "5-6", label: "Significant Need", desc: "Out-of-pocket expenses exceed 25% of monthly income. Standard limits don't cover full costs." },
    { range: "7-8", label: "High Need", desc: "Substantial tuition balance remains. Multiple family dependencies or hardships documented." },
    { range: "9-10", label: "Critical Need", desc: "Severe hardship. Candidate cannot enroll/continue without scholarship support." }
  ],
  academic: [
    { range: "1-2", label: "Unsatisfactory", desc: "GPA below 2.5 or program is not accredited." },
    { range: "3-4", label: "Satisfactory", desc: "GPA 2.5 - 3.0. Fulfills standard course requirements." },
    { range: "5-6", label: "Strong", desc: "GPA 3.0 - 3.4. Solid academic track record with positive reference reviews." },
    { range: "7-8", label: "Superior", desc: "GPA 3.4 - 3.8. Consistent high performance in challenging courses." },
    { range: "9-10", label: "Outstanding", desc: "GPA 3.8 - 4.0. Top academic honors, publishing or leadership in coursework." }
  ],
  potential: [
    { range: "1-2", label: "Lacking", desc: "Recommendation letters are generic with no leadership endorsement." },
    { range: "3-4", label: "Developing", desc: "Recommendations indicate potential to lead. Supervises minor shift tasks." },
    { range: "5-6", label: "Competent", desc: "Confirms positive communication, team supervision, and coordination." },
    { range: "7-8", label: "Distinguished", desc: "Highlights peer leadership, committee chairs, or clinical quality improvement." },
    { range: "9-10", label: "Exceptional", desc: "Active union leadership/mentorship, pioneers team training, stellar testimonials." }
  ]
};

function getRubricLevel(criteriaId: string, score: number) {
  const levels = RUBRIC_DESCRIPTIONS[criteriaId];
  if (!levels) return null;
  return levels.find(l => {
    const [min, max] = l.range.split("-").map(Number);
    return score >= min && score <= max;
  });
}

export default function ScholarshipPortal() {
  const { currentUser } = useAppStore();
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    mockScholarshipApplicants[0].id
  );

  const selectedApplicant = mockScholarshipApplicants.find(
    (a) => a.id === selectedApplicantId
  );

  const [scores, setScores] = useState<Record<string, number>>({
    need: 5,
    academic: 5,
    potential: 5
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const currentApplicantScore = mockCommitteeScores.find(
      (s) => s.applicantId === selectedApplicantId && s.memberId === currentUser?.id
    );
    setScores({
      need: currentApplicantScore?.financialNeed ?? 5,
      academic: currentApplicantScore?.academicStanding ?? 5,
      potential: currentApplicantScore?.leadershipPotential ?? 5,
    });
    setIsSubmitted(!!currentApplicantScore);
  }, [selectedApplicantId, currentUser]);

  return (
    <Layout
      title="Scholarship Committee"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "Scholarship Review" },
      ]}
    >
      <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-muted/20">
        {/* Left Sidebar: Applicant List */}
        <aside className="w-full lg:w-80 bg-card border-r border-border flex flex-col h-[35vh] lg:h-full">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Applicant Pool (2026)
            </h2>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-semibold">
              Cycle: Advanced clinical degrees
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {mockScholarshipApplicants.map((applicant) => (
              <button
                key={applicant.id}
                onClick={() => setSelectedApplicantId(applicant.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedApplicantId === applicant.id
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-xs font-bold ${selectedApplicantId === applicant.id ? "text-primary" : "text-foreground"}`}>
                    {applicant.anonymizedId}
                  </span>
                  <Badge variant="outline" className="text-[9px] h-4 px-1 bg-muted/50">
                    GPA {applicant.gpa}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mb-2">
                  {applicant.degreeProgram}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {applicant.conflictFlag && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px] h-4">Conflict</Badge>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">
                    {mockCommitteeScores.some(s => s.applicantId === applicant.id) ? "Scored" : "Pending"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {selectedApplicant ? (
            <>
              <header className="bg-card border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-primary/10 text-primary border-transparent text-[10px] font-bold uppercase">
                      Anonymized Profile
                    </Badge>
                    {selectedApplicant.conflictFlag && (
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        Conflict of Interest Detected
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-xl font-bold font-display">{selectedApplicant.anonymizedId}</h1>
                  <p className="text-xs text-muted-foreground">{selectedApplicant.degreeProgram} • {selectedApplicant.institution}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Committee Consensus</p>
                      <div className="flex items-center gap-1.5 justify-end">
                         <Lock className="w-3 h-3 text-muted-foreground" />
                         <span className="text-sm font-bold text-muted-foreground italic">Locked until all submit</span>
                      </div>
                   </div>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                   <div className="xl:col-span-2 space-y-6">
                      {/* AI Executive Summary */}
                      <Card className="border-primary/20 bg-card overflow-hidden shadow-sm">
                         <CardHeader className="pb-3 flex-row items-center gap-2 border-b border-primary/10 bg-primary/5">
                            <Brain className="w-4 h-4 text-primary" />
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">AI Applicant Insight</CardTitle>
                         </CardHeader>
                         <CardContent className="p-4">
                            <p className="text-sm leading-relaxed text-foreground italic">
                               "{selectedApplicant.aiSummary}"
                            </p>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                               <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Academic Strength</p>
                                  <div className="flex items-center gap-2">
                                     <Progress value={92} className="h-1 flex-1 bg-primary/10" />
                                     <span className="text-[10px] font-bold">Top 5%</span>
                                  </div>
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Policy Alignment</p>
                                  <div className="flex items-center gap-2">
                                     <Progress value={100} className="h-1 flex-1 bg-emerald-500/10" />
                                     <span className="text-[10px] font-bold text-emerald-600">Perfect</span>
                                  </div>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      <Tabs defaultValue="rubric" className="w-full">
                         <TabsList className="bg-brand-lightblue p-1 h-auto rounded-xl inline-flex items-center gap-1 border-none mb-6">
                            <TabsTrigger value="rubric" className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Scoring Rubric</TabsTrigger>
                            <TabsTrigger value="history" className="rounded-lg px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Past Awards</TabsTrigger>
                         </TabsList>
                         
                         <TabsContent value="rubric" className="space-y-6 pt-0">
                             <div className="grid gap-4">
                                {[
                                  { id: "need", label: "Financial Need", desc: "Based on FAFSA/SAR and personal hardship statement.", icon: Star },
                                  { id: "academic", label: "Academic Standing", desc: "Prior GPA and rigor of selected program.", icon: Trophy },
                                  { id: "potential", label: "Leadership Potential", desc: "AI sentiment analysis of recommendation letters.", icon: Zap },
                                ].map((criteria) => {
                                  const currentScore = scores[criteria.id] ?? 5;
                                  const selectedLevel = getRubricLevel(criteria.id, currentScore);
                                  return (
                                    <Card key={criteria.id} className="border-border shadow-sm">
                                       <CardContent className="p-4">
                                          <div className="flex flex-col gap-4">
                                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                   <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><criteria.icon className="w-4 h-4" /></div>
                                                   <div>
                                                      <p className="text-xs font-bold">{criteria.label}</p>
                                                      <p className="text-[10px] text-muted-foreground max-w-md">{criteria.desc}</p>
                                                   </div>
                                                </div>
                                                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                                                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                     <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => !isSubmitted && setScores(prev => ({ ...prev, [criteria.id]: num }))}
                                                        disabled={isSubmitted}
                                                        className={`w-7 h-7 rounded-md text-[10px] font-bold border transition-all ${
                                                          currentScore === num
                                                            ? "bg-primary text-white border-primary shadow-sm"
                                                            : "bg-background border-border hover:border-primary/40"
                                                        } ${isSubmitted ? "opacity-60 cursor-not-allowed" : ""}`}
                                                     >
                                                        {num}
                                                     </button>
                                                   ))}
                                                </div>
                                             </div>
                                             {selectedLevel && (
                                                <div className="p-2.5 bg-primary/5 rounded-lg border border-primary/10 text-[10px] leading-normal flex items-start gap-2">
                                                   <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                   <div>
                                                      <span className="font-bold text-primary mr-1">{selectedLevel.label} ({selectedLevel.range}):</span>
                                                      <span className="text-muted-foreground">{selectedLevel.desc}</span>
                                                   </div>
                                                </div>
                                             )}
                                          </div>
                                       </CardContent>
                                    </Card>
                                  );
                                })}
                             </div>

                             <Card className="border-border shadow-sm">
                                <CardContent className="p-4 space-y-3">
                                   <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Confidential Comments</p>
                                   <textarea 
                                      disabled={isSubmitted}
                                      className="w-full min-h-[120px] rounded-xl border border-border bg-background p-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                      placeholder="Provide rationale for your scores..."
                                      defaultValue={selectedApplicant ? mockCommitteeScores.find(s => s.applicantId === selectedApplicant.id && s.memberId === currentUser?.id)?.comments : ""}
                                   />
                                   <div className="flex justify-end gap-3">
                                      {!isSubmitted ? (
                                        <>
                                          <Button variant="outline" size="sm" className="h-9 px-4 font-bold text-xs">Save Draft</Button>
                                          <Button 
                                             onClick={() => setIsSubmitted(true)}
                                             size="sm" 
                                             className="h-9 px-6 bg-primary font-bold text-xs gap-2"
                                          >
                                             <ClipboardCheck className="w-4 h-4" />
                                             Submit Final Score
                                          </Button>
                                        </>
                                      ) : (
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                                          <CheckCircle2 className="w-4 h-4" />
                                          Consensus Score Submitted Successfully
                                        </div>
                                      )}
                                   </div>
                                </CardContent>
                             </Card>
                         </TabsContent>

                         <TabsContent value="history">
                            <Card className="border-border shadow-sm">
                               <CardContent className="p-8 text-center text-muted-foreground">
                                  <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                  <p className="text-sm font-medium">No prior applications found for this candidate.</p>
                                  <p className="text-xs mt-1">This is a first-time scholarship applicant.</p>
                               </CardContent>
                            </Card>
                         </TabsContent>
                      </Tabs>
                   </div>

                   <div className="space-y-6">
                      {/* HR Director Oversight */}
                      <Card className="border-violet-500/20 bg-violet-500/5 shadow-sm overflow-hidden">
                         <CardHeader className="pb-3 border-b border-violet-500/10 bg-violet-500/5">
                            <div className="flex items-center gap-2">
                               <Trophy className="w-4 h-4 text-violet-600" />
                               <CardTitle className="text-xs font-bold uppercase tracking-widest text-violet-700">Decision Interface</CardTitle>
                            </div>
                         </CardHeader>
                         <CardContent className="p-4 space-y-4">
                            <div className="p-3 bg-white rounded-lg border border-violet-200 space-y-2 shadow-sm">
                               <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                                  <span>Committee Quorum</span>
                                  <span>{isSubmitted ? "2 of 5 Voted" : "1 of 5 Voted"}</span>
                                </div>
                               <Progress value={isSubmitted ? 40 : 20} className="h-1 bg-violet-100" />
                               <p className="text-[10px] text-muted-foreground leading-tight italic">
                                  Final decision buttons will unlock once 5/5 committee members have submitted their private scores.
                               </p>
                            </div>

                            <div className="space-y-2 opacity-50 pointer-events-none">
                               <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Award Scholarship
                               </Button>
                               <Button variant="outline" className="w-full text-destructive border-destructive/20 font-bold h-10">
                                  Deny Application
                               </Button>
                            </div>
                         </CardContent>
                      </Card>

                      {/* Committee Status Feed */}
                      <Card className="border-border shadow-sm overflow-hidden">
                         <CardHeader className="py-3 border-b border-border bg-muted/30">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reviewer Status</CardTitle>
                         </CardHeader>
                         <CardContent className="p-0">
                            {[
                               { name: "Priya Nair", role: "HR Benefits", status: "completed" },
                               { name: currentUser?.name && currentUser.name !== "Priya Nair" ? currentUser.name : "Sarah Kim", role: currentUser?.role === "admin" ? "HR Oversight" : "Nursing Ops", status: isSubmitted ? "completed" : "pending" },
                               { name: "Derek Chen", role: "Finance", status: "pending" },
                               { name: "Dr. James Okonkwo", role: "Clinical Lead", status: "pending" },
                            ].map((reviewer, i) => (
                              <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                                 <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                                       {reviewer.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-[11px] font-bold text-foreground leading-tight">{reviewer.name}</p>
                                       <p className="text-[10px] text-muted-foreground">{reviewer.role}</p>
                                    </div>
                                 </div>
                                 <Badge variant="outline" className={`text-[8px] h-4 px-1 ${reviewer.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-muted text-muted-foreground border-transparent'}`}>
                                    {reviewer.status.toUpperCase()}
                                 </Badge>
                              </div>
                            ))}
                         </CardContent>
                      </Card>
                   </div>
                </div>
              </main>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
               <Users className="w-12 h-12 mb-4 opacity-10" />
               <h3 className="text-lg font-bold">No Applicant Selected</h3>
               <p className="text-sm mt-1">Select an anonymized profile from the left sidebar to begin review.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
