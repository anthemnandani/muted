'use client';

import Error from '@/app/error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { APPEAL_STATUS_INFO, SUSPENSION_REASONS } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';
import { AppealFormSchema } from '@/lib/validations';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import z from 'zod';

const APPEAL_MAX_LENGTH = 250;
type AppealFormValues = z.infer<typeof AppealFormSchema>;

const SuspendedClient = () => {
  const trpcUtils = api.useUtils();

  const { data, isLoading, error } = api.appeal.getSuspensionDetails.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const form = useForm<AppealFormValues>({
    resolver: zodResolver(AppealFormSchema),
    defaultValues: {
      reason: '',
    },
  });

  const reasonValue = form.watch('reason');

  const { mutate: submitAppeal, isPending: isSubmitting } =
    api.appeal.submitAppeal.useMutation({
      onSuccess: () => {
        trpcUtils.appeal.getSuspensionDetails.invalidate();
      },
      onError: (err) => {
        form.setError('root', { message: err.message });
      },
    });

  const onSubmit = (values: AppealFormValues) => {
    if (data?.suspension?.id) {
      submitAppeal({
        reason: values.reason,
        suspensionId: data.suspension.id,
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex-center h-screen'>
        <Skeleton className='w-full max-w-lg h-full' />
      </div>
    );
  }

  if (error || !data?.isSuspended || !data.suspension) {
    return <Error />;
  }

  const { suspension, appeal } = data;
  const appealInfo = appeal ? APPEAL_STATUS_INFO[appeal.status] : null;

  return (
    <div className='flex-center min-h-screen p-4 text-white/90'>
      <Card className='w-full max-w-lg bg-gray-6 border-none shadow-2xl'>
        <CardHeader className='items-center text-center'>
          <AlertTriangle className='size-12 text-primary-red' />
          <CardTitle className='mt-4 text-2xl'>
            Account Temporarily Suspended
          </CardTitle>
          <CardDescription className='text-white/65 pt-2'>
            Your account has been temporarily suspended until{' '}
            <strong className='font-bold text-primary-red'>
              {formatDate(suspension.endsAt)}
            </strong>
            .
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Separator />

          <div className='py-6'>
            <h3 className='text-lg font-semibold text-white/90'>
              Suspension Reason
            </h3>
            <ul className='mt-2 list-disc space-y-2 pl-5 text-sm text-white/65'>
              {SUSPENSION_REASONS.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>

          <Separator />

          <div className='pt-6'>
            {appealInfo ? (
              <Alert
                variant={appealInfo.variant as 'default' | 'destructive'}
                className={appealInfo.className}
              >
                {<appealInfo.icon className='size-4' />}
                <AlertTitle className='text-base text-white/90 mb-0.5'>
                  {appealInfo.title}
                </AlertTitle>
                <AlertDescription className='text-muted-foreground'>
                  {appealInfo.description}
                </AlertDescription>
              </Alert>
            ) : (
              <Fragment>
                <h3 className='text-lg font-semibold text-white/90 mb-2.5'>
                  Appeal
                </h3>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={form.control}
                      name='reason'
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TextareaAutosize
                              placeholder='Enter a reason'
                              className={cn(
                                'flex w-full rounded-md border border-white/30 bg-transparent px-3 py-3 text-sm',
                                'text-white/90 ring-0 ring-offset-0 placeholder:text-white/30 focus-visible:outline-none',
                                'focus-visible:ring-2 focus-visible:ring-sky-500 min-h-[40px] resize-none',
                                '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                              )}
                              {...field}
                              maxLength={APPEAL_MAX_LENGTH}
                              maxRows={8}
                            />
                          </FormControl>
                          <div className='flex justify-between items-center'>
                            <FormMessage />
                            <p className='text-xs text-white/50 ml-auto'>
                              {reasonValue.length} / {APPEAL_MAX_LENGTH}
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.formState.errors.root && (
                      <p className='text-sm font-medium text-red-500'>
                        {form.formState.errors.root.message}
                      </p>
                    )}

                    <Button
                      type='submit'
                      className='w-full bg-primary-blue text-white hover:bg-primary-blue/90'
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className='mr-2 size-4 animate-spin' />
                      ) : (
                        <Send className='mr-2 size-4' />
                      )}
                      Submit Appeal
                    </Button>
                  </form>
                </Form>
              </Fragment>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuspendedClient;
