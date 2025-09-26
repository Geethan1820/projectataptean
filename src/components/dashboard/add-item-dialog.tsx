'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addInventoryItem, generateSku, getInventoryItems } from '@/app/actions';
import type { InventorySize } from '@/lib/types';

const formSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
  color: z.string().min(1, 'Color is required.'),
  price: z.coerce.number().min(0, 'Price must be non-negative.'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a non-negative integer.'),
});

export default function AddItemDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isGeneratingSku, startSkuGeneration] = useTransition();
  const [skuSuggestion, setSkuSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: '',
      size: 'M',
      color: '',
      price: 0,
      quantity: 0,
    },
  });

  const size = form.watch('size');
  const color = form.watch('color');

  const handleGenerateSku = () => {
    if (!size || !color) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a size and enter a color to generate an SKU.',
      });
      return;
    }
    startSkuGeneration(async () => {
      try {
        const existingItems = await getInventoryItems();
        const existingSkus = existingItems.map(item => item.sku);
        const newSku = await generateSku({ size: size as InventorySize, color, existingSkus });
        form.setValue('sku', newSku, { shouldValidate: true });
        toast({
          title: 'SKU Generated!',
          description: `New SKU: ${newSku}`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'SKU Generation Failed',
          description: 'Could not generate a unique SKU. Please try again.',
        });
      }
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        await addInventoryItem(values);
        toast({
          title: 'Success!',
          description: `Item ${values.sku} has been added to the inventory.`,
        });
        form.reset();
        setIsOpen(false);
      } catch (error: any) {
        if (error.message.includes('SKU already exists')) {
          const existingItems = await getInventoryItems();
          const existingSkus = existingItems.map(item => item.sku);
          const newSku = await generateSku({ size: values.size as InventorySize, color: values.color, existingSkus });
          setSkuSuggestion(newSku);
        } else {
          toast({
            variant: 'destructive',
            title: 'Failed to Add Item',
            description: error.message || 'An unexpected error occurred.',
          });
        }
      }
    });
  };

  const handleUseSuggestion = () => {
      if (skuSuggestion) {
          form.setValue('sku', skuSuggestion);
          setSkuSuggestion(null);
      }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Fill in the details for the new polo t-shirt.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Blue, Red, Black" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Generate or enter a unique SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" variant="outline" onClick={handleGenerateSku} disabled={isGeneratingSku || !size || !color}>
                {isGeneratingSku ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="sr-only">Generate SKU</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Item
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!skuSuggestion} onOpenChange={() => setSkuSuggestion(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" />
                    Duplicate SKU Detected
                </AlertDialogTitle>
                <AlertDialogDescription>
                    The SKU <span className="font-mono bg-muted p-1 rounded">{form.getValues('sku')}</span> already exists. The AI suggests using the following SKU instead:
                    <br />
                    <strong className="font-mono bg-muted p-1 rounded my-2 inline-block">{skuSuggestion}</strong>
                    <br />
                    Would you like to use this suggestion?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Let me fix it</AlertDialogCancel>
                <AlertDialogAction onClick={handleUseSuggestion}>Use Suggestion</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}