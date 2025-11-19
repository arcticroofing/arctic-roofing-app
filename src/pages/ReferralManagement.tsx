import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User, Calendar, FileText, Gift, ArrowLeft } from 'lucide-react';

export default function ReferralManagement() {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    const { data } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });
    
    setReferrals(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    
    if (newStatus === 'contacted') {
      updates.contacted_at = new Date().toISOString();
    } else if (newStatus === 'signed') {
      updates.signed_at = new Date().toISOString();
    } else if (newStatus === 'approved') {
      updates.approved_at = new Date().toISOString();
      
      // Calculate reward amount
      const referrer = referrals.find(r => r.id === id);
      if (referrer) {
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', referrer.referrer_id)
          .eq('status', 'approved');
        
        const approvedCount = (count || 0) + 1;
        const cyclePosition = approvedCount % 5;
        updates.reward_amount = cyclePosition === 0 ? 400 : 200;
      }
    }

    await supabase
      .from('referrals')
      .update(updates)
      .eq('id', id);

    loadReferrals();
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: 'bg-yellow-500',
      contacted: 'bg-blue-500',
      signed: 'bg-purple-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return styles[status] || 'bg-gray-500';
  };

  const filteredReferrals = filter === 'all'
    ? referrals
    : referrals.filter(r => r.status === filter);

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    contacted: referrals.filter(r => r.status === 'contacted').length,
    signed: referrals.filter(r => r.status === 'signed').length,
    approved: referrals.filter(r => r.status === 'approved').length,
    totalRewards: referrals.reduce((sum, r) => sum + (parseFloat(r.reward_amount) || 0), 0),
  };

  return (
    <div className="flex flex-col h-full w-full bg-black min-h-screen">
      <header className="flex items-center gap-4 border-b border-[#96D7FE]/20 bg-black px-6 py-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/manager')}
          className="gap-2 text-[#96D7FE] hover:text-[#7bc5ec] hover:bg-[#96D7FE]/10"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <h1 className="text-2xl font-semibold text-white">Referral Management</h1>
      </header>

      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-blue-500/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Contacted</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.contacted}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-purple-500/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Signed</p>
                  <p className="text-2xl font-bold text-purple-500">{stats.signed}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-green-500/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Rewards</p>
                  <p className="text-2xl font-bold text-[#96D7FE]">${stats.totalRewards}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-[#96D7FE] text-black' : 'border-[#96D7FE]/30 text-[#96D7FE]'}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'bg-yellow-500 text-black' : 'border-yellow-500/30 text-yellow-500'}
            >
              Pending ({stats.pending})
            </Button>
            <Button
              variant={filter === 'contacted' ? 'default' : 'outline'}
              onClick={() => setFilter('contacted')}
              className={filter === 'contacted' ? 'bg-blue-500 text-black' : 'border-blue-500/30 text-blue-500'}
            >
              Contacted ({stats.contacted})
            </Button>
            <Button
              variant={filter === 'signed' ? 'default' : 'outline'}
              onClick={() => setFilter('signed')}
              className={filter === 'signed' ? 'bg-purple-500 text-black' : 'border-purple-500/30 text-purple-500'}
            >
              Signed ({stats.signed})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              onClick={() => setFilter('approved')}
              className={filter === 'approved' ? 'bg-green-500 text-black' : 'border-green-500/30 text-green-500'}
            >
              Approved ({stats.approved})
            </Button>
          </div>

          {/* Referrals List */}
          {loading ? (
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardContent className="p-12 text-center">
                <p className="text-white">Loading referrals...</p>
              </CardContent>
            </Card>
          ) : filteredReferrals.length === 0 ? (
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardContent className="p-12 text-center">
                <Gift className="mx-auto mb-4 text-gray-600" size={48} />
                <p className="text-white text-lg mb-2">No referrals found</p>
                <p className="text-gray-400">
                  {filter === 'all'
                    ? 'No referrals have been submitted yet.'
                    : `No ${filter} referrals.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReferrals.map((referral) => (
                <Card key={referral.id} className="bg-gray-900 border-[#96D7FE]/30 hover:border-[#96D7FE]/60 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Referral Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">
                              {referral.referred_name}
                            </h3>
                            <Badge className={`${getStatusBadge(referral.status)} text-white`}>
                              {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                            </Badge>
                          </div>
                          {referral.status === 'approved' && referral.reward_amount > 0 && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
                              <p className="text-green-500 font-bold text-lg">
                                {referral.reward_amount >= 400 ? '🏔️' : '🧊'} ${referral.reward_amount}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone size={16} className="text-[#96D7FE]" />
                            <a href={`tel:${referral.referred_phone}`} className="hover:text-[#96D7FE]">
                              {referral.referred_phone}
                            </a>
                          </div>
                          {referral.referred_email && (
                            <div className="flex items-center gap-2 text-gray-300">
                              <Mail size={16} className="text-[#96D7FE]" />
                              <a href={`mailto:${referral.referred_email}`} className="hover:text-[#96D7FE]">
                                {referral.referred_email}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-gray-300">
                            <User size={16} className="text-[#96D7FE]" />
                            <span>Referred by: {referral.referrer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar size={16} className="text-[#96D7FE]" />
                            <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {referral.notes && (
                          <div className="bg-black/50 border border-[#96D7FE]/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <FileText size={16} className="text-[#96D7FE] mt-1" />
                              <div>
                                <p className="text-gray-400 text-sm font-semibold mb-1">Notes:</p>
                                <p className="text-gray-300 text-sm">{referral.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Status Update */}
                      <div className="lg:w-64 space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm font-semibold mb-2 block">
                            Update Status
                          </label>
                          <Select
                            value={referral.status}
                            onValueChange={(value) => updateStatus(referral.id, value)}
                          >
                            <SelectTrigger className="bg-black border-[#96D7FE]/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">⏳ Pending</SelectItem>
                              <SelectItem value="contacted">📞 Contacted</SelectItem>
                              <SelectItem value="signed">✍️ Signed</SelectItem>
                              <SelectItem value="approved">✅ Approved</SelectItem>
                              <SelectItem value="rejected">❌ Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Timeline */}
                        <div className="bg-black/50 border border-[#96D7FE]/20 rounded-lg p-3">
                          <p className="text-gray-400 text-xs font-semibold mb-2">Timeline</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-gray-500">
                              <span>Submitted:</span>
                              <span>{new Date(referral.created_at).toLocaleDateString()}</span>
                            </div>
                            {referral.contacted_at && (
                              <div className="flex justify-between text-blue-400">
                                <span>Contacted:</span>
                                <span>{new Date(referral.contacted_at).toLocaleDateString()}</span>
                              </div>
                            )}
                            {referral.signed_at && (
                              <div className="flex justify-between text-purple-400">
                                <span>Signed:</span>
                                <span>{new Date(referral.signed_at).toLocaleDateString()}</span>
                              </div>
                            )}
                            {referral.approved_at && (
                              <div className="flex justify-between text-green-400">
                                <span>Approved:</span>
                                <span>{new Date(referral.approved_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
