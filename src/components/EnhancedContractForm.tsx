
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
import { CONTRACT_TYPES, JURISDICTIONS } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  secondParty: z.string().min(2, {
    message: "Second party must be at least 2 characters.",
  }),
  jurisdiction: z.string().optional(),
  description: z.string().optional(),
  keyTerms: z.string().optional(),
  intensity: z.enum(["Light", "Moderate", "Aggressive"]).default("Moderate"),
});

type FormValues = z.infer<typeof formSchema>;

const EnhancedContractForm = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      contractType: "",
      firstParty: "",
      secondParty: "",
      jurisdiction: "",
      description: "",
      keyTerms: "",
      intensity: "Moderate",
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

      // Insert the contract into the database
      const { data: contractData, error } = await supabase
        .from("contracts")
        .insert({
          user_id: user.id,
          title: data.title,
          contract_type: data.contractType,
          first_party_name: data.firstParty,
          second_party_name: data.secondParty,
          jurisdiction: data.jurisdiction || null,
          description: data.description || null,
          key_terms: data.keyTerms || null,
          intensity: data.intensity,
        })
        .select();

      if (error) throw error;

      // In a real application, we would generate the contract here
      // For now, we just show a success message

      toast.success("Contract created", {
        description: "Your contract has been created successfully.",
      });

      // Reset the form
      form.reset();

      // Navigate back to contracts page
      setTimeout(() => {
        navigate("/contracts");
      }, 1500);
    } catch (error: any) {
      toast.error("Failed to create contract", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                  <FormLabel>First Party</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondParty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second Party</FormLabel>
                  <FormControl>
                    <Input placeholder="Other Party Name" {...field} />
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
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Contract...
            </>
          ) : (
            "Generate Contract"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EnhancedContractForm;
