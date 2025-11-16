import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateProjectStages, type Project, type ProjectStage } from '../services/projectService';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';

interface ProjectStagesProps {
  project: Project;
  isManager: boolean;
}

export function ProjectStages({ project, isManager }: ProjectStagesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stages, setStages] = useState<ProjectStage[]>(project.stages);

  const updateStagesMutation = useMutation({
    mutationFn: (updatedStages: ProjectStage[]) =>
      updateProjectStages(project.id, updatedStages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: 'Progress Updated',
        description: 'Project stages have been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update project stages. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const toggleStage = (stageId: string) => {
    if (!isManager) return;

    const updatedStages = stages.map((stage) => {
      if (stage.id === stageId) {
        return {
          ...stage,
          completed: !stage.completed,
          completedDate: !stage.completed ? new Date().toISOString() : null,
        };
      }
      return stage;
    });

    setStages(updatedStages);
    updateStagesMutation.mutate(updatedStages);
  };

  const completedCount = stages.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedCount / stages.length) * 100);

  return (
    <Card className="bg-gray-900 border-[#96D7FE]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base sm:text-lg">Project Progress</CardTitle>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold text-[#96D7FE]">
              {progressPercentage}%
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              {completedCount} of {stages.length} stages
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 sm:h-4 mt-4">
          <div
            className="bg-[#96D7FE] h-3 sm:h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
                stage.completed
                  ? 'bg-green-500/10 border-green-500'
                  : 'bg-gray-800 border-gray-700'
              } ${isManager ? 'cursor-pointer hover:border-[#96D7FE]' : ''}`}
              onClick={() => isManager && toggleStage(stage.id)}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-1">
                  {stage.completed ? (
                    <CheckCircle2 className="text-green-500" size={24} />
                  ) : (
                    <Circle className="text-gray-500" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm font-semibold text-gray-400">
                          Stage {index + 1}
                        </span>
                      </div>
                      <h4
                        className={`text-base sm:text-lg font-semibold mb-2 ${
                          stage.completed ? 'text-green-400' : 'text-white'
                        }`}
                      >
                        {stage.name}
                      </h4>
                    </div>
                  </div>
                  {stage.completed && stage.completedDate && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mt-2">
                      <Calendar size={14} />
                      <span>
                        Completed on{' '}
                        {new Date(stage.completedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {isManager && (
          <div className="mt-4 p-3 bg-[#96D7FE]/10 border border-[#96D7FE]/30 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-300">
              💡 Click on any stage to mark it as complete or incomplete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}