
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTRACT_TYPES, JURISDICTIONS, AI_MODELS } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import ContractPreview from "./ContractPreview";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  contractType: z.string({
    required_error: "Please select a contract type.",
  }),
  firstParty: z.string().min(2, {
    message: "First party must be at least 2 characters.",
  }),
  firstPartyAddress: z.string().min(5, {
    message: "First party address must be at least 5 characters.",
  }),
  secondParty: z.string().min(2, {
    message: "Second party must be at least 2 characters.",
  }),
  secondPartyAddress: z.string().min(5, {
    message: "Second party address must be at least 5 characters.",
  }),
  jurisdiction: z.string().optional(),
  description: z.string().optional(),
  keyTerms: z.string().optional(),
  intensity: z.enum(["Light", "Moderate", "Aggressive"]).default("Moderate"),
  aiModel: z.string().default("openai"),
});

type FormValues = z.infer<typeof formSchema>;

const EnhancedContractForm = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [contractData, setContractData] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      contractType: "",
      firstParty: "",
      firstPartyAddress: "",
      secondParty: "",
      secondPartyAddress: "",
      jurisdiction: "",
      description: "",
      keyTerms: "",
      intensity: "Moderate",
      aiModel: "openai",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please log in to create contracts.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setContractData(data);
      setShowPreview(true);
    } catch (error: any) {
      toast.error("Failed to generate contract", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
  };

  const handleContractSaved = () => {
    setTimeout(() => {
      navigate("/documents");
    }, 1500);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Employment Agreement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contract type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTRACT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Party Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstPartyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Party Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="123 Business St, City, State, 12345" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a jurisdiction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JURISDICTIONS.map((jurisdiction) => (
                          <SelectItem key={jurisdiction} value={jurisdiction}>
                            {jurisdiction}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The governing law for this contract.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="secondParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Party Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Other Party Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondPartyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Party Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="456 Partner Ave, City, State, 67890" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe what this contract should cover..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keyTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Terms (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any specific terms you want to include..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="intensity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Intensity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Light">Light</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How protective should this contract be for the first party.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AI_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.model})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    AI model to use for generating the contract
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Contract...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Contract
              </>
            )}
          </Button>
        </form>
      </Form>

      {showPreview && contractData && (
        <ContractPreview 
          contract={{
            title: contractData.title,
            contractType: contractData.contractType,
            firstParty: contractData.firstParty,
            firstPartyAddress: contractData.firstPartyAddress,
            secondParty: contractData.secondParty,
            secondPartyAddress: contractData.secondPartyAddress,
            jurisdiction: contractData.jurisdiction,
            description: contractData.description,
            keyTerms: contractData.keyTerms,
            intensity: contractData.intensity,
            aiModel: contractData.aiModel
          }} 
          onClose={handlePreviewClose}
          onSaved={handleContractSaved}
        />
      )}
    </>
  );
};

export default EnhancedContractForm;
