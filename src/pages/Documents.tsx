
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import DocumentCard from "@/components/DocumentCard";

type DocumentStatus = "analyzing" | "completed" | "error";
type RiskLevel = "low" | "medium" | "high";

interface CompletedDocument {
  id: string;
  title: string;
  date: string;
  status: "completed";
  riskLevel: RiskLevel;
  riskScore: number;
  findings: string[];
}

interface AnalyzingDocument {
  id: string;
  title: string;
  date: string;
  status: "analyzing";
  progress: number;
}

interface ErrorDocument {
  id: string;
  title: string;
  date: string;
  status: "error";
  error: string;
}

type DocumentType = CompletedDocument | AnalyzingDocument | ErrorDocument;

const Documents = () => {
  const [documents, setDocuments] = useState<DocumentType[]>([
    {
      id: "1",
      title: "Non-Disclosure Agreement",
      date: "June 15, 2023",
      status: "completed" as const,
      riskLevel: "low" as const,
      riskScore: 25,
      findings: [
        "Standard NDA terms",
        "2-year confidentiality period",
        "Proper jurisdiction clause",
      ],
    },
    {
      id: "2",
      title: "Employment Contract",
      date: "July 3, 2023",
      status: "completed" as const,
      riskLevel: "medium" as const,
      riskScore: 58,
      findings: [
        "Non-standard termination clause",
        "Restrictive covenant may need review",
        "Missing arbitration provision",
      ],
    },
    {
      id: "3",
      title: "Software License Agreement",
      date: "August 12, 2023",
      status: "completed" as const,
      riskLevel: "high" as const,
      riskScore: 82,
      findings: [
        "Unlimited liability clause",
        "Ambiguous licensing terms",
        "No clear termination process",
        "Potential IP rights conflicts",
      ],
    },
    {
      id: "4",
      title: "Partnership Agreement",
      date: "September 5, 2023",
      status: "analyzing" as const,
      progress: 65,
    },
    {
      id: "5",
      title: "Service Level Agreement",
      date: "September 8, 2023",
      status: "error" as const,
      error: "Invalid document format. Please upload a PDF or DOCX file.",
    },
  ]);

  const handleUploadDocument = () => {
    const newDoc: AnalyzingDocument = {
      id: `${Date.now()}`,
      title: "New Document",
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: "analyzing" as const,
      progress: 0,
    };

    setDocuments((prevDocs) => [...prevDocs, newDoc]);

    // Simulate document analysis progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      
      if (progress <= 100) {
        setDocuments((prevDocs) => {
          return prevDocs.map(doc => {
            if (doc.id === newDoc.id && doc.status === "analyzing") {
              return {
                ...doc,
                progress
              };
            }
            return doc;
          });
        });
      }

      if (progress === 100) {
        clearInterval(interval);
        
        // After analysis is complete, update the document status
        setTimeout(() => {
          setDocuments((prevDocs) => {
            return prevDocs.map(doc => {
              if (doc.id === newDoc.id) {
                const completedDoc: CompletedDocument = {
                  id: doc.id,
                  title: "Partnership Agreement",
                  date: doc.date,
                  status: "completed" as const,
                  riskLevel: "medium" as const,
                  riskScore: 45,
                  findings: [
                    "Non-standard profit sharing",
                    "Unclear exit strategy",
                    "Missing mediation clause"
                  ]
                };
                
                return completedDoc;
              }
              return doc;
            });
          });
          
          toast("Document analysis complete", {
            description: "Review the findings to identify potential risks",
          });
        }, 1000);
      }
    }, 500);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
    
    toast("Document deleted", {
      description: "The document has been removed from your list",
    });
  };

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
            
            <button
              onClick={handleUploadDocument}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Upload Document
            </button>
          </div>
          
          {documents.length === 0 ? (
            <div className="text-center py-20">
              <FilePlus className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first document to analyze potential risks
              </p>
              <button
                onClick={handleUploadDocument}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Upload Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  {...doc}
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
