'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsQR from 'jsqr';
import { QrCode, Loader2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { addInventoryItem, addBatchTransactions, getInventoryItems } from '@/app/actions';
import type { InventoryItem } from '@/lib/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  sku: z.string().min(1, 'SKU is required.'),
  size: z.enum(['S', 'M', 'L', 'XL', 'XXL']),
  color: z.string().min(1, 'Color is required.'),
  price: z.coerce.number().min(0, 'Price must be non-negative.'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a non-negative integer.'),
});

export default function ScanComponent() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [existingItem, setExistingItem] = useState<InventoryItem | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: '',
      size: 'M',
      color: '',
      price: 0,
      quantity: 1,
    },
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsScanning(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };
    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;

    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            setIsScanning(false);
            handleScannedCode(code.data);
          }
        }
      }
      if (isScanning) {
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    if (isScanning) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning]);
  
  const handleScannedCode = async (sku: string) => {
    toast({ title: 'Code Scanned!', description: `SKU: ${sku}` });
    const items = await getInventoryItems();
    const foundItem = items.find(item => item.sku === sku);
    if(foundItem) {
        setExistingItem(foundItem);
        form.reset({
            sku: foundItem.sku,
            size: foundItem.size,
            color: foundItem.color,
            price: foundItem.price,
            quantity: foundItem.quantity,
        });
    } else {
        setExistingItem(null);
        const skuParts = sku.split('-');
        form.reset({
            sku: sku,
            size: skuParts[1] as any || 'M',
            color: skuParts[2] || '',
            price: 0,
            quantity: 1,
        });
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        if(existingItem) {
           const operations = [];

            // Check if item details changed
            if (values.price !== existingItem.price || values.color !== existingItem.color) {
              operations.push({
                sku: values.sku,
                update: { price: values.price, color: values.color },
              });
            }

            // Check if quantity changed
            const quantityChange = values.quantity - existingItem.quantity;
            if (quantityChange !== 0) {
              operations.push({
                sku: values.sku,
                transaction: {
                  type: quantityChange > 0 ? 'IN' : 'OUT',
                  quantity: Math.abs(quantityChange),
                },
              });
            }

            if(operations.length > 0) {
              const result = await addBatchTransactions(operations);
              if (result.success) {
                toast({
                  title: 'Success!',
                  description: `Item ${values.sku} has been updated.`,
                });
                router.push('/');
              } else {
                throw new Error(result.message);
              }
            } else {
               toast({
                  title: 'No Changes Detected',
                  description: 'The item details and quantity are the same.',
                });
            }
        } else {
          await addInventoryItem(values);
          toast({
            title: 'Success!',
            description: `New item ${values.sku} has been added.`,
          });
          router.push('/');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to Save Item',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    });
  };

  return (
    <div className="space-y-8">
        <Button variant="ghost" onClick={() => router.push('/')}><ArrowLeft className="mr-2" /> Back to Dashboard</Button>
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><QrCode/> Scan Product Barcode/QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="relative aspect-video w-full max-w-md mx-auto bg-muted rounded-md overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2/3 h-1/2 border-4 border-dashed border-primary rounded-lg" />
                    </div>
                )}
            </div>

            {hasCameraPermission === false && (
                <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access in your browser settings to use this feature.
                </AlertDescription>
                </Alert>
            )}

            <Button onClick={() => setIsScanning(true)} disabled={isScanning || hasCameraPermission !== true} className="w-full">
                {isScanning ? <Loader2 className="animate-spin mr-2"/> : <QrCode className="mr-2"/>}
                {isScanning ? 'Scanning...' : 'Start Scan'}
            </Button>
        
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                        <Input placeholder="Scanned SKU will appear here" {...field} readOnly={!!existingItem} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!existingItem}>
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
                            <Input placeholder="e.g., Blue" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
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

                <Button type="submit" disabled={isPending || form.getValues('sku') === ''} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {existingItem ? 'Update Item' : 'Add New Item'}
                </Button>
            </form>
            </Form>
        </CardContent>
        </Card>
    </div>
  );
}
