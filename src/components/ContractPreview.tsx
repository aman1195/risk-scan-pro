
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ContractPreviewProps {
  contract: {
    id: string;
    title: string;
    contractType: string;
    firstParty: string;
    secondParty: string;
    jurisdiction?: string;
    description?: string;
    keyTerms?: string;
    intensity: string;
  };
  onClose: () => void;
  onSaved: () => void;
}

const ContractPreview = ({ contract, onClose, onSaved }: ContractPreviewProps) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Generate a formatted date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Insert the contract data into Supabase
      const { error } = await supabase
        .from('contracts')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          title: contract.title,
          contract_type: contract.contractType,
          first_party_name: contract.firstParty,
          second_party_name: contract.secondParty,
          jurisdiction: contract.jurisdiction || null,
          description: contract.description || null,
          key_terms: contract.keyTerms || null,
          intensity: contract.intensity
        });
        
      if (error) throw error;
      
      setSaved(true);
      onSaved();
      toast.success("Contract saved successfully");
    } catch (error: any) {
      toast.error("Failed to save contract", {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDownload = () => {
    const element = document.createElement("a");
    const contractText = document.getElementById("contract-preview")?.innerText || "";
    const file = new Blob([contractText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${contract.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{contract.title} - Preview</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        
        <div className="overflow-auto p-6 flex-grow" id="contract-preview">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold uppercase mb-2">{contract.contractType}</h1>
              <p className="text-muted-foreground">This agreement is made on {currentDate}</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">PARTIES</h2>
              <p>
                <strong>BETWEEN:</strong> {contract.firstParty} ("First Party")
              </p>
              <p>
                <strong>AND:</strong> {contract.secondParty} ("Second Party")
              </p>
              
              {contract.jurisdiction && (
                <p className="mt-4">
                  <strong>JURISDICTION:</strong> This agreement shall be governed by the laws of {contract.jurisdiction}.
                </p>
              )}
            </div>
            
            {contract.description && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">BACKGROUND</h2>
                <p>{contract.description}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">AGREEMENT</h2>
              <p>
                The parties agree to enter into this {contract.contractType} according to the terms and conditions set out in this document.
              </p>
            </div>
            
            {contract.keyTerms && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">KEY TERMS</h2>
                <p className="whitespace-pre-line">{contract.keyTerms}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">SIGNATURES</h2>
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div>
                  <p><strong>For and on behalf of {contract.firstParty}:</strong></p>
                  <div className="border-b border-dashed border-gray-400 h-12 mt-8"></div>
                  <p className="mt-2">Name: _______________________</p>
                  <p className="mt-2">Title: _______________________</p>
                  <p className="mt-2">Date: _______________________</p>
                </div>
                <div>
                  <p><strong>For and on behalf of {contract.secondParty}:</strong></p>
                  <div className="border-b border-dashed border-gray-400 h-12 mt-8"></div>
                  <p className="mt-2">Name: _______________________</p>
                  <p className="mt-2">Title: _______________________</p>
                  <p className="mt-2">Date: _______________________</p>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground mt-12">
              This document was generated by RiskScan with {contract.intensity} protection level
              <br/>
              End of Document
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleSave} disabled={saving || saved}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              "Save Contract"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
