'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { updateInventoryItem, addTransaction } from '@/app/actions';
import type { InventoryItem } from '@/lib/types';

const updateFormSchema = z.object({
  price: z.coerce.number().min(0, 'Price must be non-negative.'),
  color: z.string().min(1, 'Color is required.'),
});

const transactionFormSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1.'),
});

interface UpdateItemDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: InventoryItem;
}

export default function UpdateItemDialog({ isOpen, setIsOpen, item }: UpdateItemDialogProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const updateForm = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      price: item.price,
      color: item.color,
    },
  });

  const transactionForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'IN',
      quantity: 1,
    },
  });

  useEffect(() => {
    if (item) {
      updateForm.reset({ price: item.price, color: item.color });
      transactionForm.reset({ type: 'IN', quantity: 1 });
    }
  }, [item, updateForm, transactionForm]);

  const onUpdateSubmit = (values: z.infer<typeof updateFormSchema>) => {
    startTransition(async () => {
      try {
        await updateInventoryItem(item.sku, values);
        toast({
          title: 'Success!',
          description: `Item ${item.sku} has been updated.`,
        });
        setIsOpen(false);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to Update Item',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    });
  };

  const onTransactionSubmit = (values: z.infer<typeof transactionFormSchema>) => {
    startTransition(async () => {
      try {
        await addTransaction({ sku: item.sku, ...values });
        toast({
          title: 'Transaction Successful!',
          description: `${values.quantity} units have been processed for ${item.sku}.`,
        });
        setIsOpen(false);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Transaction Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update: {item.sku}</DialogTitle>
          <DialogDescription>
            Current Quantity: {item.quantity}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="transaction">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transaction">Stock Transaction</TabsTrigger>
            <TabsTrigger value="details">Update Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transaction">
            <Form {...transactionForm}>
              <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={transactionForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Transaction Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="IN" />
                            </FormControl>
                            <FormLabel className="font-normal">Stock IN</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="OUT" />
                            </FormControl>
                            <FormLabel className="font-normal">Stock OUT</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transactionForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Process Transaction
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="details">
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={updateForm.control}
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
                  control={updateForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
