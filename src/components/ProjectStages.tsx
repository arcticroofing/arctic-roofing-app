import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProjectStage {
  id: string;
  name: string;
  completed: boolean;
  completedDate: string | null;
}

interface Project {
  id: string;
  stages: ProjectStage[];
  progress: number;
}

interface ProjectStagesProps {
  project: Project;
  isManager: boolean;
  onStagesUpdate?: (stages: ProjectStage[]) => void;
}

export const ProjectStages: React.FC<ProjectStagesProps> = ({ project, isManager, onStagesUpdate }) => {
  const handleStageToggle = (stageId: string) => {
    if (!isManager || !onStagesUpdate) return;

    const updatedStages = project.stages.map((stage) => {
      if (stage.id === stageId) {
        return {
          ...stage,
          completed: !stage.completed,
          completedDate: !stage.completed ? new Date().toISOString() : null,
        };
      }
      return stage;
    });

    onStagesUpdate(updatedStages);
  };

  return (
    <Card className="bg-gray-900 border-[#96D7FE]/30">
      <CardHeader>
        <CardTitle className="text-white">Project Stages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {project.stages.map((stage, index) => (
            <div
              key={stage.id}
              onClick={() => isManager && handleStageToggle(stage.id)}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                stage.completed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-gray-800 border-gray-700'
              } ${isManager ? 'cursor-pointer hover:border-[#96D7FE] hover:shadow-lg hover:shadow-[#96D7FE]/10' : ''}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  {stage.completed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-400">Stage {index + 1}</span>
                  </div>
                  <h4
                    className={`text-lg font-semibold ${
                      stage.completed ? 'text-green-400' : 'text-white'
                    }`}
                  >
                    {stage.name}
                  </h4>
                  {stage.completed && stage.completedDate && (
                    <p className="text-sm text-gray-400 mt-1">
                      Completed: {new Date(stage.completedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {isManager && (
                <div className="flex items-center pointer-events-none">
                  <Checkbox
                    checked={stage.completed}
                    className="h-5 w-5 border-[#96D7FE] data-[state=checked]:bg-[#96D7FE] data-[state=checked]:text-black"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 font-medium">Overall Progress</span>
            <span className="text-2xl font-bold text-[#96D7FE]">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-[#96D7FE] h-3 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};