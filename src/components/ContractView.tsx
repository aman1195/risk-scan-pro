
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Copy, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";

interface ContractViewProps {
  contract: {
    id: string;
    title: string;
    contract_type: string;
    first_party_name: string;
    second_party_name: string;
    jurisdiction: string | null;
    created_at: string;
    contract_content?: string;
  };
  onClose: () => void;
}

const ContractView = ({ contract, onClose }: ContractViewProps) => {
  const [loading, setLoading] = useState(false);
  
  const handleDownloadPDF = async () => {
    const element = document.getElementById('contract-content');
    if (!element) return;
    
    try {
      setLoading(true);
      toast.info("Preparing PDF...");
      
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${contract.title.replace(/\s+/g, '_')}.pdf`);
      
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadDocx = async () => {
    try {
      setLoading(true);
      toast.info("Preparing DOCX...");
      
      const content = document.getElementById('contract-content');
      
      const { data, error } = await supabase.functions.invoke('convert-to-docx', {
        body: {
          html: content?.innerHTML,
          filename: contract.title.replace(/\s+/g, '_')
        }
      });
      
      if (error) throw error;
      
      if (data && data.url) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = data.url;
        link.download = `${contract.title.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("DOCX downloaded successfully");
      } else {
        throw new Error("Failed to generate DOCX");
      }
    } catch (error: any) {
      console.error("DOCX generation error:", error);
      toast.error("Failed to generate DOCX", {
        description: error.message || "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = () => {
    const content = document.getElementById('contract-content');
    if (!content) return;
    
    const contractText = content.innerText;
    navigator.clipboard.writeText(contractText)
      .then(() => {
        toast.success("Contract copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy contract");
      });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{contract.title}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        
        <div className="overflow-auto p-6 flex-grow">
          <div id="contract-content" className="max-w-3xl mx-auto">
            {contract.contract_content ? (
              <div dangerouslySetInnerHTML={{ __html: contract.contract_content }} />
            ) : (
              <div className="text-center p-10 border rounded-lg">
                <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No contract content available</h3>
                <p className="text-muted-foreground">
                  This contract doesn't have any content saved.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={loading || !contract.contract_content}
            className="flex items-center"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            PDF
          </Button>
          <Button 
            variant="outline"
            onClick={handleDownloadDocx}
            disabled={loading || !contract.contract_content}
            className="flex items-center"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            DOCX
          </Button>
          <Button 
            variant="outline"
            onClick={handleCopy}
            disabled={!contract.contract_content}
            className="flex items-center"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractView;
