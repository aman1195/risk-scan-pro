
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, AlertTriangle, Check, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RiskIndicator from "./RiskIndicator";

const contractTypes = [
  { id: "nda", name: "Non-Disclosure Agreement" },
  { id: "employment", name: "Employment Agreement" },
  { id: "service", name: "Service Agreement" },
  { id: "licensing", name: "Licensing Agreement" },
  { id: "partnership", name: "Partnership Agreement" },
];

const formSchema = z.object({
  contractType: z.string().min(1, "Please select a contract type"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  firstParty: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().optional(),
    email: z.string().email().optional(),
  }),
  secondParty: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address: z.string().optional(),
    email: z.string().email().optional(),
  }),
  riskLevel: z.enum(["low", "medium", "high"]),
  details: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ContractForm = () => {
  const [activeTab, setActiveTab] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractType: "",
      title: "",
      firstParty: {
        name: "",
        address: "",
        email: "",
      },
      secondParty: {
        name: "",
        address: "",
        email: "",
      },
      riskLevel: "low",
      details: "",
    },
  });

  const riskLevel = form.watch("riskLevel");
  const contractType = form.watch("contractType");

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Form values:", values);
    
    toast({
      title: "Contract created successfully",
      description: "Your contract has been created and is ready for review.",
    });
    
    setIsSubmitting(false);
    setActiveTab("preview");
  };

  const getRiskScoreFromLevel = (level: string) => {
    switch (level) {
      case "low":
        return 30;
      case "medium":
        return 65;
      case "high":
        return 90;
      default:
        return 0;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-card p-6 md:p-8">
      <Tabs
        defaultValue="form"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="form" disabled={isSubmitting}>Contract Details</TabsTrigger>
          <TabsTrigger value="preview" disabled={!form.formState.isValid}>Preview</TabsTrigger>
          <TabsTrigger value="risks" disabled={!form.formState.isValid}>Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium">Create New Contract</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Draft
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contract type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of contract you want to create
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contract title" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive title for your contract
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Party Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">First Party</h4>
                    
                    <FormField
                      control={form.control}
                      name="firstParty.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="firstParty.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="firstParty.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Second Party</h4>
                    
                    <FormField
                      control={form.control}
                      name="secondParty.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondParty.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondParty.address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="riskLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Level</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <div className="flex flex-col space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                            {["low", "medium", "high"].map((level) => (
                              <Button
                                key={level}
                                type="button"
                                variant={field.value === level ? "default" : "outline"}
                                className={cn(
                                  "flex items-center justify-center py-6",
                                  field.value === level && "border-2 border-primary"
                                )}
                                onClick={() => field.onChange(level)}
                              >
                                {level === "low" && <Check className="mr-2 h-4 w-4 text-green-500" />}
                                {level === "medium" && <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />}
                                {level === "high" && <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />}
                                {level.charAt(0).toUpperCase() + level.slice(1)} Risk
                              </Button>
                            ))}
                          </div>
                          <RiskIndicator level={field.value as any} score={getRiskScoreFromLevel(field.value)} />
                        </div>
                      </FormControl>
                    </div>
                    <FormDescription>
                      Select the risk level for this contract
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional details or clauses"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Any specific clauses or details you want to include
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Creating..." : "Create Contract"}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="preview" className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">Contract Preview</h2>
            <Button className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 shadow-sm">
            {contractType && (
              <div className="mb-8">
                <h3 className="text-xl font-medium text-center mb-6">
                  {contractTypes.find((t) => t.id === contractType)?.name}
                </h3>
                <div className="text-center text-muted-foreground mb-8">
                  {form.watch("title")}
                </div>
                
                <div className="border-b pb-4 mb-4">
                  <h4 className="font-medium mb-2">Parties</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">First Party:</p>
                      <p>{form.watch("firstParty.name")}</p>
                      {form.watch("firstParty.email") && (
                        <p className="text-sm text-muted-foreground">
                          {form.watch("firstParty.email")}
                        </p>
                      )}
                      {form.watch("firstParty.address") && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {form.watch("firstParty.address")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Second Party:</p>
                      <p>{form.watch("secondParty.name")}</p>
                      {form.watch("secondParty.email") && (
                        <p className="text-sm text-muted-foreground">
                          {form.watch("secondParty.email")}
                        </p>
                      )}
                      {form.watch("secondParty.address") && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {form.watch("secondParty.address")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  <h4>Agreement Terms</h4>
                  <p>
                    This agreement is made between {form.watch("firstParty.name")} and{" "}
                    {form.watch("secondParty.name")} on {new Date().toLocaleDateString()}.
                  </p>
                  
                  {contractType === "nda" && (
                    <>
                      <h5>1. Confidentiality</h5>
                      <p>
                        Both parties agree to maintain the confidentiality of all proprietary information shared between them.
                      </p>
                      
                      <h5>2. Term</h5>
                      <p>
                        This agreement shall remain in effect for a period of 2 years from the date of signing.
                      </p>
                    </>
                  )}
                  
                  {contractType === "employment" && (
                    <>
                      <h5>1. Employment Terms</h5>
                      <p>
                        The employer agrees to employ the employee according to the terms and conditions set forth in this agreement.
                      </p>
                      
                      <h5>2. Compensation</h5>
                      <p>
                        The employee shall receive compensation as agreed upon by both parties.
                      </p>
                    </>
                  )}
                  
                  {form.watch("details") && (
                    <>
                      <h5>Additional Terms</h5>
                      <p className="whitespace-pre-line">{form.watch("details")}</p>
                    </>
                  )}
                  
                  <h5>Signatures</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <div className="border-t pt-4">
                      <p>{form.watch("firstParty.name")}</p>
                      <p className="text-sm text-muted-foreground">Date: _________________</p>
                    </div>
                    <div className="border-t pt-4">
                      <p>{form.watch("secondParty.name")}</p>
                      <p className="text-sm text-muted-foreground">Date: _________________</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium">Risk Analysis</h2>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Risk Assessment</h3>
              <RiskIndicator
                level={riskLevel as any}
                score={getRiskScoreFromLevel(riskLevel)}
                size="lg"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Potential Issues</h4>
                <ul className="space-y-2">
                  {riskLevel === "low" && (
                    <>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                        <span className="text-sm">Standard contract terms with low risk profile</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2 mt-0.5">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                        <span className="text-sm">Clear party identification</span>
                      </li>
                    </>
                  )}
                  
                  {riskLevel === "medium" && (
                    <>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        </div>
                        <span className="text-sm">Some non-standard clauses present</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-2 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        </div>
                        <span className="text-sm">Moderate liability exposure</span>
                      </li>
                    </>
                  )}
                  
                  {riskLevel === "high" && (
                    <>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        </div>
                        <span className="text-sm">Significant liability exposure</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        </div>
                        <span className="text-sm">Highly customized terms may create ambiguity</span>
                      </li>
                      <li className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2 mt-0.5">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        </div>
                        <span className="text-sm">Legal review strongly recommended</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <div className="p-4 rounded-lg bg-secondary">
                  {riskLevel === "low" && (
                    <p className="text-sm">
                      This contract has a low risk profile. Standard review procedures recommended.
                    </p>
                  )}
                  
                  {riskLevel === "medium" && (
                    <p className="text-sm">
                      This contract has a medium risk profile. Additional review by a qualified team member is recommended before finalization.
                    </p>
                  )}
                  
                  {riskLevel === "high" && (
                    <p className="text-sm">
                      This contract has a high risk profile. Legal review is strongly recommended before proceeding. Consider revising high-risk clauses.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractForm;
