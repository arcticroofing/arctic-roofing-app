import { supabase } from '@/lib/supabase';

export interface ProjectStage {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  completedDate: string | null;
}

export interface ProjectUpdate {
  id: string;
  date: string;
  title: string;
  description: string;
  author: string;
  photos?: string[];
}

export interface Project {
  id: string;
  homeownerName: string;
  homeownerEmail: string;
  address: string;
  projectType: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  startDate: string;
  estimatedCompletion: string;
  projectManager: string;
  budget: number;
  updates: ProjectUpdate[];
  photos: string[];
  scope: string[];
  stages: ProjectStage[];
}

function getDefaultStages(): ProjectStage[] {
  return [
    {
      id: 1,
      name: "Arrival & Setup",
      description: "Crew arrives and introduces themselves, Property protection set up (tarps, driveway, plants, AC units), Materials and tools organized",
      completed: false,
      completedDate: null
    },
    {
      id: 2,
      name: "Roof Removal",
      description: "Old shingles and materials removed, Roof deck inspected for damage, Any bad wood replaced if needed",
      completed: false,
      completedDate: null
    },
    {
      id: 3,
      name: "Installation",
      description: "Ice & water shield and underlayment installed, Drip edge, flashing, and vents placed, New shingles installed according to manufacturer specs",
      completed: false,
      completedDate: null
    },
    {
      id: 4,
      name: "Cleanup & Final Check",
      description: "Ground magnets used to remove nails, All debris and tarps cleaned up, Final roof inspection completed",
      completed: false,
      completedDate: null
    },
    {
      id: 5,
      name: "Completion",
      description: "Photos uploaded to your portal, Homeowner walkthrough (if available), Warranty and final documents sent",
      completed: false,
      completedDate: null
    }
  ];
}

export const getProjects = async (): Promise<Project[]> => {
  console.log('Fetching projects from Supabase...');
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  console.log('Projects fetched:', data);
  
  return (data || []).map(project => ({
    id: project.id,
    homeownerName: project.homeowner_name,
    homeownerEmail: project.homeowner_email,
    address: project.address,
    projectType: project.project_type,
    status: project.status,
    progress: project.progress,
    startDate: project.start_date,
    estimatedCompletion: project.estimated_completion,
    projectManager: project.project_manager,
    budget: project.budget,
    scope: project.scope || [],
    photos: project.photos || [],
    stages: project.stages || getDefaultStages(),
    updates: []
  }));
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  console.log('Fetching project:', id);
  
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    console.error('Error fetching project:', projectError);
    return undefined;
  }

  const { data: updates, error: updatesError } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('date', { ascending: false });

  return {
    id: project.id,
    homeownerName: project.homeowner_name,
    homeownerEmail: project.homeowner_email,
    address: project.address,
    projectType: project.project_type,
    status: project.status,
    progress: project.progress,
    startDate: project.start_date,
    estimatedCompletion: project.estimated_completion,
    projectManager: project.project_manager,
    budget: project.budget,
    scope: project.scope || [],
    photos: project.photos || [],
    stages: project.stages || getDefaultStages(),
    updates: (updates || []).map(u => ({
      id: u.id,
      date: u.date,
      title: u.title,
      description: u.description,
      author: u.author,
      photos: u.photos || []
    }))
  };
};

export const createProject = async (projectData: any): Promise<Project> => {
  console.log('Creating project in Supabase:', projectData);
  
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      homeowner_name: projectData.homeownerName,
      homeowner_email: projectData.homeownerEmail,
      address: projectData.address,
      project_type: projectData.projectType,
      status: projectData.status,
      start_date: projectData.startDate,
      estimated_completion: projectData.estimatedCompletion,
      project_manager: projectData.projectManager,
      budget: projectData.budget,
      scope: projectData.scope,
      progress: 0,
      photos: [],
      stages: getDefaultStages()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return {
    id: data.id,
    homeownerName: data.homeowner_name,
    homeownerEmail: data.homeowner_email,
    address: data.address,
    projectType: data.project_type,
    status: data.status,
    progress: data.progress,
    startDate: data.start_date,
    estimatedCompletion: data.estimated_completion,
    projectManager: data.project_manager,
    budget: data.budget,
    scope: data.scope || [],
    photos: data.photos || [],
    stages: data.stages || getDefaultStages(),
    updates: []
  };
};

export const addProjectUpdate = async (
  projectId: string,
  update: Omit<ProjectUpdate, 'id'>
): Promise<Project | undefined> => {
  console.log('Adding update to project:', projectId);
  
  const { error } = await supabase
    .from('project_updates')
    .insert([{
      project_id: projectId,
      date: update.date,
      title: update.title,
      description: update.description,
      author: update.author,
      photos: update.photos || []
    }]);

  if (error) {
    console.error('Error adding update:', error);
    return undefined;
  }

  return getProjectById(projectId);
};

export const updateProjectStatus = async (
  id: string,
  status: Project['status'],
  progress: number
): Promise<Project | undefined> => {
  const { error } = await supabase
    .from('projects')
    .update({ status, progress })
    .eq('id', id);

  if (error) {
    console.error('Error updating project:', error);
    return undefined;
  }

  return getProjectById(id);
};

export const updateProjectStages = async (
  projectId: string,
  stages: ProjectStage[]
): Promise<Project | undefined> => {
  console.log('Updating project stages:', projectId);
  
  // Calculate progress based on completed stages
  const completedStages = stages.filter(s => s.completed).length;
  const progress = Math.round((completedStages / stages.length) * 100);
  
  // Determine status based on progress
  let status: Project['status'] = 'Not Started';
  if (progress === 100) {
    status = 'Completed';
  } else if (progress > 0) {
    status = 'In Progress';
  }
  
  const { error } = await supabase
    .from('projects')
    .update({ 
      stages,
      progress,
      status
    })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating stages:', error);
    return undefined;
  }

  return getProjectById(projectId);
};

export const deleteProject = async (id: string): Promise<void> => {
  console.log('Deleting project:', id);
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};