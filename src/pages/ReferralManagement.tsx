import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useManager } from '../contexts/ManagerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, Mail, Trash2, CheckCircle, XCircle, Clock, UserCheck, FileSignature, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateUTC } from '@/lib/utils';

export default function ReferralManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { manager, loading: managerLoading } = useManager();

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', manager?.id],
    queryFn: async () => {
      if (!manager?.id) return [];
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('manager_id', manager.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!manager?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      
      if (status === 'contacted') {
        updates.contacted_at = new Date().toISOString();
      } else if (status === 'signed') {
        updates.signed_at = new Date().toISOString();
      } else if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        
        // Calculate reward
        const referral = referrals?.find((r: any) => r.id === id);
        if (referral) {
          const { count } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', referral.referrer_id)
            .eq('status', 'approved');
          
          const approvedCount = (count || 0) + 1;
          const cyclePosition = approvedCount % 5;
          updates.reward_amount = cyclePosition === 0 ? 400 : 200;
        }
      }

      const { error } = await supabase
        .from('referrals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Referral status updated',
      });
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteReferralMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('referrals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Referral deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'contacted':
        return 'bg-blue-500';
      case 'signed':
        return 'bg-purple-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'contacted':
        return <Phone className="h-4 w-4" />;
      case 'signed':
        return <FileSignature className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (managerLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in as a manager to view referrals.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/manager/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/manager/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track customer referrals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referrals?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {referrals?.filter((r: any) => r.status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {referrals?.filter((r: any) => r.status === 'approved').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${referrals?.reduce((sum: number, r: any) => sum + (parseFloat(r.reward_amount) || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrals List */}
        <div className="space-y-4">
          {referrals?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
                <p className="text-muted-foreground">
                  Referrals will appear here when homeowners submit them
                </p>
              </CardContent>
            </Card>
          ) : (
            referrals?.map((referral: any) => (
              <Card key={referral.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{referral.referred_name}</CardTitle>
                      <CardDescription>
                        Referred by: {referral.referrer_name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(referral.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(referral.status)}
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{referral.referred_phone}</span>
                    </div>
                    {referral.referred_email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{referral.referred_email}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {referral.notes && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm text-muted-foreground">{referral.notes}</p>
                    </div>
                  )}

                  {/* Reward */}
                  {referral.status === 'approved' && referral.reward_amount > 0 && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {referral.reward_amount >= 400 ? '🏔️' : '🧊'} Reward: ${referral.reward_amount}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {referral.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: referral.id, status: 'contacted' })}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Mark Contacted
                      </Button>
                    )}
                    {referral.status === 'contacted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: referral.id, status: 'signed' })}
                      >
                        <FileSignature className="h-4 w-4 mr-2" />
                        Mark Signed
                      </Button>
                    )}
                    {referral.status === 'signed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: referral.id, status: 'approved' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: referral.id, status: 'rejected' })}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete referral for ${referral.referred_name}?`)) {
                          deleteReferralMutation.mutate(referral.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {/* Timeline */}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p>Submitted: {formatDateUTC(referral.created_at)}</p>
                    {referral.contacted_at && (
                      <p>Contacted: {formatDateUTC(referral.contacted_at)}</p>
                    )}
                    {referral.signed_at && (
                      <p>Signed: {formatDateUTC(referral.signed_at)}</p>
                    )}
                    {referral.approved_at && (
                      <p>Approved: {formatDateUTC(referral.approved_at)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
