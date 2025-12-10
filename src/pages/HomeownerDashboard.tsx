import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Home, Calendar, DollarSign, CheckCircle2, Clock, Image as ImageIcon, Gift, LogOut, Plus } from 'lucide-react';
import { formatDateUTC } from '@/lib/utils';

export default function HomeownerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [homeowner, setHomeowner] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [referralForm, setReferralForm] = useState({
    referred_name: '',
    referred_phone: '',
    referred_email: '',
    notes: '',
  });

  useEffect(() => {
    loadHomeownerData();
  }, []);

  const loadHomeownerData = async () => {
    try {
      const storedHomeowner = localStorage.getItem('homeownerSession');
      if (!storedHomeowner) {
        navigate('/homeowner/login');
        return;
      }

      const homeownerData = JSON.parse(storedHomeowner);
      setHomeowner(homeownerData);

      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('homeowner_id', homeownerData.id)
        .single();

      if (projectData) setProject(projectData);

      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', homeownerData.id)
        .order('created_at', { ascending: false });

      setReferrals(referralsData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('homeownerSession');
    navigate('/homeowner/login');
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referralForm.referred_name || !referralForm.referred_phone) {
      toast({
        title: 'Missing Information',
        description: 'Please enter name and phone number',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('referrals').insert({
        referrer_id: homeowner.id,
        referrer_name: homeowner.name,
        referred_name: referralForm.referred_name,
        referred_phone: referralForm.referred_phone,
        referred_email: referralForm.referred_email,
        notes: referralForm.notes,
        status: 'pending',
        manager_id: project?.manager_id,
      });

      if (error) throw error;

      toast({
        title: 'Success! 🎉',
        description: 'Your referral has been submitted',
      });

      setShowReferralDialog(false);
      setReferralForm({ referred_name: '', referred_phone: '', referred_email: '', notes: '' });
      loadHomeownerData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit referral',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-500';
      case 'Completed': return 'bg-green-500';
      case 'On Hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'contacted': return 'bg-blue-500';
      case 'signed': return 'bg-purple-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!homeowner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/homeowner/login')} className="w-full">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const approvedReferrals = referrals.filter(r => r.status === 'approved');
  const totalRewards = approvedReferrals.reduce((sum, r) => sum + (parseFloat(r.reward_amount) || 0), 0);
  const cyclePosition = approvedReferrals.length % 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {homeowner.name}!</h1>
            <p className="text-muted-foreground mt-1">Track your project and earn rewards</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {project ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Your Project</CardTitle>
                  <CardDescription>{project.project_type}</CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Home className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{project.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDateUTC(project.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">${project.budget?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Project Progress</p>
                  <p className="text-sm font-bold text-primary">{project.progress}%</p>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>

              <div>
                <h3 className="font-semibold mb-3">Project Stages</h3>
                <div className="space-y-2">
                  {project.stages?.map((stage: any) => (
                    <div key={stage.id} className={`flex items-center gap-3 p-3 rounded-lg border ${stage.completed ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'bg-muted'}`}>
                      {stage.completed ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                      <div className="flex-1">
                        <p className={`font-medium ${stage.completed ? 'text-green-700' : ''}`}>{stage.name}</p>
                        {stage.completed && stage.completedDate && (
                          <p className="text-xs text-muted-foreground">Completed: {formatDateUTC(stage.completedDate)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {project.photos && project.photos.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Project Photos ({project.photos.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {project.photos.map((photo: string, index: number) => (
                      <img key={index} src={photo} alt={`Project ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Project Yet</h3>
              <p className="text-muted-foreground">Your project will appear here once created.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-6 w-6" />
                  Referral Rewards
                </CardTitle>
                <CardDescription>Earn $200 per referral, $400 for every 5th!</CardDescription>
              </div>
              <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Submit Referral</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit a Referral</DialogTitle>
                    <DialogDescription>Refer someone and earn rewards!</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleReferralSubmit} className="space-y-4">
                    <div>
                      <Label>Name *</Label>
                      <Input value={referralForm.referred_name} onChange={(e) => setReferralForm({...referralForm, referred_name: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input type="tel" value={referralForm.referred_phone} onChange={(e) => setReferralForm({...referralForm, referred_phone: e.target.value})} required />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={referralForm.referred_email} onChange={(e) => setReferralForm({...referralForm, referred_email: e.target.value})} />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={referralForm.notes} onChange={(e) => setReferralForm({...referralForm, notes: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full">Submit Referral</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{referrals.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedReferrals.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Rewards</p>
                  <p className="text-2xl font-bold text-green-600">${totalRewards}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Progress to Next Reward ({cyclePosition}/5)</p>
              <Progress value={(cyclePosition / 5) * 100} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {cyclePosition === 4 ? 'Next reward: $400 🏔️' : `${5 - cyclePosition} more referrals to $${cyclePosition === 4 ? 400 : 200}`}
              </p>
            </div>

            {referrals.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Your Referrals</h3>
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{referral.referred_name}</p>
                      <p className="text-sm text-muted-foreground">{referral.referred_phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {referral.status === 'approved' && referral.reward_amount > 0 && (
                        <Badge className="bg-green-500">${referral.reward_amount}</Badge>
                      )}
                      <Badge className={getReferralStatusColor(referral.status)}>
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
