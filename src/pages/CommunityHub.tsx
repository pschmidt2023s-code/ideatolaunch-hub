import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/community/PostCard";
import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import { CreatePostDialog } from "@/components/community/CreatePostDialog";
import { TrendRadarSection } from "@/components/community/TrendRadarSection";
import { SupplierIntelligenceSection } from "@/components/community/SupplierIntelligenceSection";
import { FounderCaseStudiesSection } from "@/components/community/FounderCaseStudiesSection";
import { FounderCircles } from "@/components/community/FounderCircles";
import { FounderMatchSection } from "@/components/community/FounderMatchSection";
import { ExperimentsFeed } from "@/components/community/ExperimentsFeed";
import { FeedbackSection } from "@/components/community/FeedbackSection";
import { StartupLogs } from "@/components/community/StartupLogs";
import { FounderLeaderboard } from "@/components/community/FounderLeaderboard";
import { WeeklyDigest } from "@/components/community/WeeklyDigest";
import { IntelligenceFeed } from "@/components/community/IntelligenceFeed";
import { useCommunityPosts, useToggleUpvote, PostType } from "@/hooks/useCommunity";
import { Plus, Rocket, MessageCircle, TrendingUp, BookOpen, Handshake, Lock, Search, Factory, Radar, FlaskConical, MessageSquare, BookMarked, Trophy, Newspaper, Activity } from "lucide-react";

const CATEGORIES = [
  { key: "all", label: "Alle", icon: MessageCircle },
  { key: "launch", label: "Launches", icon: Rocket },
  { key: "supplier_experience", label: "Supplier", icon: Search },
  { key: "growth", label: "Growth", icon: TrendingUp },
  { key: "lesson", label: "Lessons", icon: BookOpen },
  { key: "feedback", label: "Feedback", icon: MessageCircle },
];

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState("feed");
  const [postFilter, setPostFilter] = useState<string | undefined>();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<PostType>("launch");

  const { data: posts, isLoading } = useCommunityPosts(postFilter);
  const upvote = useToggleUpvote();

  const handleCreate = (type: PostType) => {
    setCreateType(type);
    setCreateOpen(true);
  };

  return (
    <DashboardLayout>
      <SEO
        title="Founder Intelligence Network – BrandOS"
        description="Das Gründer-Netzwerk für Marktdaten, Supplier Reviews, Case Studies und Founder Matching."
        path="/dashboard/community"
      />
      <PageHeader
        title="Founder Intelligence Network"
        description="Echte Insights von echten Gründern – Experimente, Supplier Reviews, Trend Radar und strategischer Austausch."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <TabsList className="bg-muted/50 h-auto flex-wrap">
            <TabsTrigger value="feed" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" />Feed</TabsTrigger>
            <TabsTrigger value="network" className="gap-1.5 text-xs"><MessageCircle className="h-3.5 w-3.5" />Network</TabsTrigger>
            <TabsTrigger value="experiments" className="gap-1.5 text-xs"><FlaskConical className="h-3.5 w-3.5" />Experiments</TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1.5 text-xs"><MessageSquare className="h-3.5 w-3.5" />Feedback</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5 text-xs"><BookMarked className="h-3.5 w-3.5" />Startup Logs</TabsTrigger>
            <TabsTrigger value="signals" className="gap-1.5 text-xs"><Radar className="h-3.5 w-3.5" />Trend Radar</TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-1.5 text-xs"><Factory className="h-3.5 w-3.5" />Supplier Intel</TabsTrigger>
            <TabsTrigger value="cases" className="gap-1.5 text-xs"><BookOpen className="h-3.5 w-3.5" />Case Studies</TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-1.5 text-xs"><Trophy className="h-3.5 w-3.5" />Leaderboard</TabsTrigger>
            <TabsTrigger value="digest" className="gap-1.5 text-xs"><Newspaper className="h-3.5 w-3.5" />Digest</TabsTrigger>
            <TabsTrigger value="match" className="gap-1.5 text-xs"><Handshake className="h-3.5 w-3.5" />Match</TabsTrigger>
            <TabsTrigger value="circles" className="gap-1.5 text-xs"><Lock className="h-3.5 w-3.5" />Circles</TabsTrigger>
          </TabsList>
          <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleCreate("launch")}>
            <Plus className="h-3.5 w-3.5" /> Beitrag erstellen
          </Button>
        </div>

        {/* INTELLIGENCE FEED */}
        <TabsContent value="feed">
          <IntelligenceFeed />
        </TabsContent>

        {/* FOUNDER NETWORK */}
        <TabsContent value="network" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={postFilter === (key === "all" ? undefined : key) && key !== "all" ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => setPostFilter(key === "all" ? undefined : key)}
              >
                <Icon className="h-3 w-3" /> {label}
              </Button>
            ))}
          </div>
          {isLoading && <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}</div>}
          {!isLoading && (!posts || posts.length === 0) && (
            <div className="text-center py-16">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-sm mb-1">Noch keine Beiträge</h3>
              <p className="text-xs text-muted-foreground mb-4">Sei der Erste und teile deine Erfahrungen.</p>
              <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleCreate("launch")}>
                <Plus className="h-3.5 w-3.5" /> Ersten Beitrag erstellen
              </Button>
            </div>
          )}
          <div className="space-y-3">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} onSelect={setSelectedPost} onUpvote={(id) => upvote.mutate({ postId: id })} />
            ))}
          </div>
        </TabsContent>

        {/* EXPERIMENTS */}
        <TabsContent value="experiments">
          <ExperimentsFeed />
        </TabsContent>

        {/* FEEDBACK / ROAST */}
        <TabsContent value="feedback">
          <FeedbackSection onSelectPost={setSelectedPost} />
        </TabsContent>

        {/* STARTUP LOGS */}
        <TabsContent value="logs">
          <StartupLogs />
        </TabsContent>

        {/* TREND RADAR */}
        <TabsContent value="signals">
          <TrendRadarSection />
        </TabsContent>

        {/* SUPPLIER INTELLIGENCE */}
        <TabsContent value="suppliers">
          <SupplierIntelligenceSection />
        </TabsContent>

        {/* CASE STUDIES */}
        <TabsContent value="cases">
          <FounderCaseStudiesSection />
        </TabsContent>

        {/* LEADERBOARD */}
        <TabsContent value="leaderboard">
          <FounderLeaderboard />
        </TabsContent>

        {/* WEEKLY DIGEST */}
        <TabsContent value="digest">
          <WeeklyDigest />
        </TabsContent>

        {/* FOUNDER MATCH */}
        <TabsContent value="match">
          <div className="flex justify-end mb-4">
            <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleCreate("match_request")}>
              <Plus className="h-3.5 w-3.5" /> Match-Anfrage erstellen
            </Button>
          </div>
          <FounderMatchSection />
        </TabsContent>

        {/* PRIVATE CIRCLES */}
        <TabsContent value="circles">
          <FounderCircles />
        </TabsContent>
      </Tabs>

      <PostDetailDialog postId={selectedPost} onClose={() => setSelectedPost(null)} />
      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} defaultType={createType} />
    </DashboardLayout>
  );
}
