
import { useState } from "react";
import { PlusCircle, Upload, Search, Filter, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import Navbar from "@/components/Navbar";
import DocumentCard from "@/components/DocumentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for documents
const mockDocuments = [
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
    title: "Partnership Agreement",
    date: "August 10, 2023",
    status: "completed" as const,
    riskLevel: "high" as const,
    riskScore: 82,
    findings: [
      "Ambiguous profit sharing mechanism",
      "Limited liability provisions may not be enforceable",
      "Insufficient dispute resolution procedures",
      "Exit strategy lacks clarity",
    ],
  },
  {
    id: "4",
    title: "Service Agreement",
    date: "August 22, 2023",
    status: "analyzing" as const,
    progress: 45,
  },
  {
    id: "5",
    title: "Software License",
    date: "September 5, 2023",
    status: "error" as const,
  },
];

const Documents = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [isUploading, setIsUploading] = useState(false);

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    toast({
      title: "Document deleted",
      description: "The document has been successfully deleted.",
    });
  };

  const handleViewDocument = (id: string) => {
    console.log("View document", id);
    toast({
      title: "Opening document",
      description: "The document is being prepared for viewing.",
    });
  };

  const handleUpload = () => {
    setIsUploading(true);
    
    // Simulate file upload and processing
    setTimeout(() => {
      const newDocument = {
        id: `${documents.length + 1}`,
        title: "New Upload",
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        status: "analyzing" as const,
        progress: 10,
      };
      
      setDocuments([newDocument, ...documents]);
      setIsUploading(false);
      
      toast({
        title: "Document uploaded",
        description: "Your document is now being analyzed.",
      });
      
      // Simulate progress updates
      let progress = 10;
      const interval = setInterval(() => {
        progress += 10;
        
        if (progress <= 100) {
          setDocuments((prevDocs) =>
            prevDocs.map((doc) =>
              doc.id === newDocument.id
                ? { ...doc, progress }
                : doc
            )
          );
        }
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Set to completed after analysis
          setTimeout(() => {
            setDocuments((prevDocs) =>
              prevDocs.map((doc) =>
                doc.id === newDocument.id
                  ? {
                      ...doc,
                      status: "completed" as const,
                      riskLevel: "medium" as const,
                      riskScore: 55,
                      findings: [
                        "Analysis complete",
                        "Some potential issues detected",
                        "Review recommended",
                      ],
                    }
                  : doc
              )
            );
            
            toast({
              title: "Analysis complete",
              description: "Your document has been analyzed successfully.",
            });
          }, 1000);
        }
      }, 1000);
    }, 1500);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || doc.status === statusFilter;
    const matchesRisk =
      riskFilter === "all" ||
      (doc.status === "completed" && doc.riskLevel === riskFilter);
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-medium mb-2">Documents</h1>
              <p className="text-lg text-muted-foreground">
                Manage and analyze your documents
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleUpload}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Document"}
              </Button>
              
              <Link to="/contracts">
                <Button className="w-full sm:w-auto flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Contract
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="glass-card p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="col-span-1">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="analyzing">Analyzing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Select
                  value={riskFilter}
                  onValueChange={setRiskFilter}
                  disabled={statusFilter !== "all" && statusFilter !== "completed"}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by risk" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  {...doc}
                  onDelete={handleDeleteDocument}
                  onView={handleViewDocument}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all" || riskFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload a document or create a contract to get started"}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleUpload}
                >
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
                <Link to="/contracts">
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create Contract
                  </Button>
                </Link>
              </div>
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
