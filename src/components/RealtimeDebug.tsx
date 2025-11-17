import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const RealtimeDebug: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [status, setStatus] = React.useState<string>('Not connected');
  const [lastUpdate, setLastUpdate] = React.useState<string>('None');

  React.useEffect(() => {
    const channel = supabase
      .channel('debug-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('🐛 DEBUG: Received update:', payload);
          if ((payload.new as any)?.id === projectId) {
            setLastUpdate(new Date().toLocaleTimeString());
          }
        }
      )
      .subscribe((status) => {
        setStatus(status);
        console.log('🐛 DEBUG: Status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const testUpdate = async () => {
    console.log('🧪 Testing manual update...');
    const { error } = await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) {
      console.error('❌ Test update failed:', error);
    } else {
      console.log('✅ Test update sent');
    }
  };

  return (
    <Card className="bg-gray-900 border-yellow-500/50">
      <CardHeader>
        <CardTitle className="text-yellow-500 text-sm">🐛 Realtime Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="text-gray-400">
          <span className="font-semibold">Status:</span> {status}
        </div>
        <div className="text-gray-400">
          <span className="font-semibold">Last Update:</span> {lastUpdate}
        </div>
        <div className="text-gray-400">
          <span className="font-semibold">Project ID:</span> {projectId.slice(0, 8)}...
        </div>
        <Button 
          onClick={testUpdate} 
          size="sm" 
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          Test Update
        </Button>
      </CardContent>
    </Card>
  );
};