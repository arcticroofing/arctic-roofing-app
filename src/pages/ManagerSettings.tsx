import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Manager {
  id: string;
  email: string;
  name: string;
  phone: string;
  photo: string;
}

export default function ManagerSettings() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    photo: '',
  });

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    const { data } = await supabase
      .from('managers')
      .select('*')
      .order('name');
    
    if (data) setManagers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update existing manager
      const { error } = await supabase
        .from('managers')
        .update(formData)
        .eq('id', editingId);

      if (!error) {
        toast({ title: 'Manager updated!' });
      }
    } else {
      // Create new manager
      const { error } = await supabase
        .from('managers')
        .insert(formData);

      if (!error) {
        toast({ title: 'Manager added!' });
      }
    }

    setFormData({ email: '', name: '', phone: '', photo: '' });
    setShowForm(false);
    setEditingId(null);
    loadManagers();
  };

  const handleEdit = (manager: Manager) => {
    setFormData({
      email: manager.email,
      name: manager.name,
      phone: manager.phone,
      photo: manager.photo,
    });
    setEditingId(manager.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this manager?')) {
      await supabase.from('managers').delete().eq('id', id);
      toast({ title: 'Manager deleted' });
      loadManagers();
    }
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
        <h1 className="text-2xl font-semibold text-white">Manager Settings</h1>
      </header>

      <main className="flex-1 overflow-auto bg-black p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Add Manager Button */}
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#96D7FE] text-black hover:bg-[#7bc5ec]"
            >
              <Plus size={20} className="mr-2" />
              Add Manager
            </Button>
          )}

          {/* Add/Edit Form */}
          {showForm && (
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardHeader>
                <CardTitle className="text-white">
                  {editingId ? 'Edit Manager' : 'Add New Manager'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-gray-400">Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="john@arcticroofing.com"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Phone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="+19075551234"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Photo URL</Label>
                    <Input
                      type="url"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      className="bg-black border-[#96D7FE]/30 text-white"
                      placeholder="https://i.pravatar.cc/150?img=12"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Try: https://i.pravatar.cc/150?img=12 (change number 1-70)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-[#96D7FE] text-black hover:bg-[#7bc5ec]"
                    >
                      {editingId ? 'Update' : 'Add'} Manager
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({ email: '', name: '', phone: '', photo: '' });
                      }}
                      className="flex-1 border-[#96D7FE]/30 text-[#96D7FE]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Managers List */}
          {managers.length === 0 && !showForm ? (
            <Card className="bg-gray-900 border-[#96D7FE]/30">
              <CardContent className="p-12 text-center">
                <p className="text-gray-400 text-lg mb-4">No managers yet</p>
                <p className="text-gray-500 text-sm">Click "Add Manager" to create your first manager profile</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {managers.map((manager) => (
                <Card key={manager.id} className="bg-gray-900 border-[#96D7FE]/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={manager.photo}
                        alt={manager.name}
                        className="w-16 h-16 rounded-full border-2 border-[#96D7FE]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=12';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{manager.name}</h3>
                        <p className="text-gray-400 text-sm">{manager.email}</p>
                        <p className="text-gray-400 text-sm">{manager.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(manager)}
                          className="border-[#96D7FE]/30 text-[#96D7FE] hover:bg-[#96D7FE]/10"
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(manager.id)}
                          className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={18} />
                        </Button>
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
