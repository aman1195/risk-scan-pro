import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus, FilePlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import DocumentCard from "@/components/DocumentCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DocumentType, RiskLevel } from "@/types";

const Documents = () => {
  const { user } = useAuthContext();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Convert database documents to the application's expected format
        const formattedDocuments: DocumentType[] = data.map(doc => {
          const date = new Date(doc.created_at).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          });

          if (doc.status === "analyzing") {
            return {
              id: doc.id,
              title: doc.title,
              date,
              status: "analyzing" as const,
              progress: 65, // Placeholder progress value
            };
          } else if (doc.status === "error") {
            return {
              id: doc.id,
              title: doc.title,
              date,
              status: "error" as const,
              error: doc.error_message || "An unknown error occurred",
            };
          } else {
            // Ensure findings is an array of strings
            const findings = doc.findings ? 
              (Array.isArray(doc.findings) ? doc.findings : [String(doc.findings)]) : 
              [];
            
            return {
              id: doc.id,
              title: doc.title,
              date,
              status: "completed" as const,
              riskLevel: (doc.risk_level as RiskLevel) || "medium",
              riskScore: doc.risk_score || 50,
              findings: findings.map(f => String(f)),
              recommendations: doc.recommendations,
            };
          }
        });

        setDocuments(formattedDocuments);
      } catch (error: any) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleDeleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
      
      toast("Document deleted", {
        description: "The document has been removed from your list",
      });
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document", {
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium mb-2">Your Documents</h1>
              <p className="text-lg text-muted-foreground">
                Upload and analyze your legal documents
              </p>
            </div>
            
            <Link to="/document-analysis">
              <Button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors">
                <Plus className="h-5 w-5" />
                Upload Document
              </Button>
            </Link>
          </div>
          
          {documents.length === 0 ? (
            <div className="text-center py-20">
              <FilePlus className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first document to analyze potential risks
              </p>
              <Link to="/document-analysis">
                <Button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors">
                  <Plus className="h-5 w-5" />
                  Upload Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  date={doc.date}
                  status={doc.status}
                  riskLevel={doc.status === "completed" ? doc.riskLevel : undefined}
                  riskScore={doc.status === "completed" ? doc.riskScore : undefined}
                  findings={doc.status === "completed" ? doc.findings : undefined}
                  recommendations={doc.status === "completed" ? doc.recommendations : undefined}
                  progress={doc.status === "analyzing" ? doc.progress : undefined}
                  error={doc.status === "error" ? doc.error : undefined}
                  onDelete={() => handleDeleteDocument(doc.id)}
                  onView={(id) => console.log("View document", id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RiskScan. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Documents;
