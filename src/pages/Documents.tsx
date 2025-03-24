
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Plus, FilePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import DocumentCard from "@/components/DocumentCard";
import { Document } from "@/types/document";

const Documents = () => {
  const queryClient = useQueryClient();

  // Function to format document data from Supabase
  const formatDocument = (doc: any): Document => {
    const formattedDate = new Date(doc.date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });

    if (doc.status === 'completed') {
      return {
        id: doc.id,
        title: doc.title,
        date: formattedDate,
        status: 'completed',
        riskLevel: doc.risk_level,
        riskScore: doc.risk_score,
        findings: doc.findings || [],
      };
    } else if (doc.status === 'analyzing') {
      return {
        id: doc.id,
        title: doc.title,
        date: formattedDate,
        status: 'analyzing',
        progress: doc.progress || 0,
      };
    } else {
      return {
        id: doc.id,
        title: doc.title,
        date: formattedDate,
        status: 'error',
        error: doc.error_message || 'Unknown error',
      };
    }
  };

  // Fetch documents from Supabase
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(formatDocument);
    }
  });

  // Mutation for deleting a document
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['documents'], (oldData: Document[] | undefined) => 
        oldData ? oldData.filter(doc => doc.id !== id) : []
      );
      
      toast("Document deleted", {
        description: "The document has been removed from your list",
      });
    },
    onError: (error) => {
      console.error("Error deleting document:", error);
      toast("Error deleting document", {
        description: "There was a problem deleting the document. Please try again.",
      });
    }
  });

  // Mutation for adding a new document
  const addDocumentMutation = useMutation({
    mutationFn: async () => {
      const newDoc = {
        title: "New Document",
        status: "analyzing",
        progress: 0
      };
      
      const { data, error } = await supabase
        .from('documents')
        .insert(newDoc)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      simulateAnalysisProgress(newDoc.id);
    },
    onError: (error) => {
      console.error("Error adding document:", error);
      toast("Error adding document", {
        description: "There was a problem adding the document. Please try again.",
      });
    }
  });

  const simulateAnalysisProgress = (docId: string) => {
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 10;
      
      if (progress <= 100) {
        // Update progress in Supabase
        await supabase
          .from('documents')
          .update({ progress })
          .eq('id', docId);
        
        // Invalidate the query to refresh the data
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      }

      if (progress === 100) {
        clearInterval(interval);
        
        // After analysis is complete, update the document status
        setTimeout(async () => {
          const completedDoc = {
            status: "completed",
            risk_level: "medium",
            risk_score: 45,
            findings: [
              "Non-standard profit sharing",
              "Unclear exit strategy",
              "Missing mediation clause"
            ]
          };
          
          await supabase
            .from('documents')
            .update(completedDoc)
            .eq('id', docId);
          
          queryClient.invalidateQueries({ queryKey: ['documents'] });
          
          toast("Document analysis complete", {
            description: "Review the findings to identify potential risks",
          });
        }, 1000);
      }
    }, 500);
  };

  const handleDeleteDocument = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleUploadDocument = () => {
    addDocumentMutation.mutate();
  };

  if (error) {
    console.error("Error fetching documents:", error);
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
            
            <button
              onClick={handleUploadDocument}
              disabled={addDocumentMutation.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {addDocumentMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              Upload Document
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents && documents.length === 0 ? (
            <div className="text-center py-20">
              <FilePlus className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first document to analyze potential risks
              </p>
              <button
                onClick={handleUploadDocument}
                disabled={addDocumentMutation.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg inline-flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {addDocumentMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                Upload Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {documents?.map((doc) => (
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
