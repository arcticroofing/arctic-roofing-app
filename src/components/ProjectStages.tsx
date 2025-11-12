import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { updateProjectStages } from '../services/projectService';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';
import type { Project, ProjectStage } from '../services/projectService';

interface ProjectStagesProps {
  project: Project;
  isManager?: boolean;
}

export function ProjectStages({ project, isManager = false }: ProjectStagesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stages, setStages] = useState<ProjectStage[]>(project.stages || []);

  const updateStagesMutation = useMutation({
    mutationFn: (updatedStages: ProjectStage[]) => 
      updateProjectStages(project.id, updatedStages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: "Stages Updated",
        description: "Project stages have been updated successfully.",
      });
    },
  });

  const toggleStage = (stageId: number) => {
    if (!isManager) return;

    const updatedStages = stages.map(stage => {
      if (stage.id === stageId) {
        return {
          ...stage,
          completed: !stage.completed,
          completedDate: !stage.completed ? new Date().toISOString() : null
        };
      }
      return stage;
    });

    setStages(updatedStages);
    updateStagesMutation.mutate(updatedStages);
  };

  const completedCount = stages.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  return (
    <Card className="bg-gray-900 border-[#96D7FE]/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Project Stages</span>
          <span className="text-[#96D7FE] text-lg">{completedCount}/{stages.length} Complete</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          {isManager ? 'Check off stages as they are completed' : 'Track your project progress through each stage'}
        </CardDescription>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span className="font-semibold text-[#96D7FE]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#96D7FE] to-[#7bc5ec] h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`p-4 rounded-lg border transition-all ${
              stage.completed
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-gray-800/50 border-gray-700'
            }`}
          >
            <div className="flex items-start gap-3">
              {isManager ? (
                <Checkbox
                  id={`stage-${stage.id}`}
                  checked={stage.completed}
                  onCheckedChange={() => toggleStage(stage.id)}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1">
                  {stage.completed ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <Circle className="text-gray-500" size={20} />
                  )}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-500">
                    Stage {index + 1}
                  </span>
                  {stage.completed && stage.completedDate && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(stage.completedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <h4 className={`font-semibold mb-2 ${
                  stage.completed ? 'text-green-400' : 'text-white'
                }`}>
                  {stage.name}
                </h4>
                
                <ul className="text-sm text-gray-400 space-y-1">
                  {stage.description.split(',').map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#96D7FE] mt-1">•</span>
                      <span>{item.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}