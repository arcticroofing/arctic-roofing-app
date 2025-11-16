import { supabase } from '@/lib/supabase';
import { createHomeownerAccount } from './authService';

export interface ProjectStage {
  id: string;
  name: string;
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
  startDate: string;
  estimatedCompletion: string;
  projectManager: string;
  budget: number;
  scope: string[];
  progress: number;
  photos: string[];
  stages: ProjectStage[];
  updates: ProjectUpdate[];
  photoGalleryUrl?: string;
  shingleSelection?: string;
  gutterColor?: string;
  gutterSize?: string;
}

export const createProject = async (projectData: {
  homeownerName: string;
  homeownerEmail: string;
  address: string;
  projectType: string;
  startDate: string;
  estimatedCompletion: string;
  projectManager: string;
  budget: number;
  scope: string[];
  shingleSelection: string;
  gutterColor?: string;
  gutterSize?: string;
}): Promise<{ project: Project; homeowner: any; temporaryPassword: string }> => {
  console.log('Creating project with data:', projectData);

  const defaultStages = [
    { id: '1', name: 'Initial Inspection', completed: false, completedDate: null },
    { id: '2', name: 'Material Delivery', completed: false, completedDate: null },
    { id: '3', name: 'Roof Installation', completed: false, completedDate: null },
    { id: '4', name: 'Clean Up', completed: false, completedDate: null },
    { id: '5', name: 'Final Inspection', completed: false, completedDate: null },
  ];

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        homeowner_name: projectData.homeownerName,
        homeowner_email: projectData.homeownerEmail,
        address: projectData.address,
        project_type: projectData.projectType,
        status: 'Not Started',
        start_date: projectData.startDate,
        estimated_completion: projectData.estimatedCompletion,
        project_manager: projectData.projectManager,
        budget: projectData.budget,
        scope: projectData.scope,
        progress: 0,
        photos: [],
        stages: defaultStages,
        shingle_selection: projectData.shingleSelection,
        gutter_color: projectData.gutterColor || 'Not Selected',
        gutter_size: projectData.gutterSize || 'Not Selected',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  console.log('Project created:', data);

  const { homeowner, temporaryPassword } = await createHomeownerAccount(
    projectData.homeownerName,
    projectData.homeownerEmail,
    data.id
  );

  return {
    project: {
      id: data.id,
      homeownerName: data.homeowner_name,
      homeownerEmail: data.homeowner_email,
      address: data.address,
      projectType: data.project_type,
      status: data.status,
      startDate: data.start_date,
      estimatedCompletion: data.estimated_completion,
      projectManager: data.project_manager,
      budget: data.budget,
      scope: data.scope,
      progress: data.progress,
      photos: data.photos || [],
      stages: data.stages,
      updates: [],
      shingleSelection: data.shingle_selection,
      gutterColor: data.gutter_color,
      gutterSize: data.gutter_size,
    },
    homeowner,
    temporaryPassword,
  };
};

export const getAllProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  const { data: updatesData } = await supabase
    .from('project_updates')
    .select('*')
    .order('date', { ascending: false });

  return data.map((project) => ({
    id: project.id,
    homeownerName: project.homeowner_name,
    homeownerEmail: project.homeowner_email,
    address: project.address,
    projectType: project.project_type,
    status: project.status,
    startDate: project.start_date,
    estimatedCompletion: project.estimated_completion,
    projectManager: project.project_manager,
    budget: project.budget,
    scope: project.scope,
    progress: project.progress,
    photos: project.photos || [],
    stages: project.stages || [],
    updates: (updatesData || [])
      .filter((update) => update.project_id === project.id)
      .map((update) => ({
        id: update.id,
        date: update.date,
        title: update.title,
        description: update.description,
        author: update.author,
        photos: update.photos || [],
      })),
    photoGalleryUrl: project.photo_gallery_url,
    shingleSelection: project.shingle_selection,
    gutterColor: project.gutter_color,
    gutterSize: project.gutter_size,
  }));
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching project:', error);
    return null;
  }

  const { data: updatesData } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('date', { ascending: false });

  const updates = (updatesData || []).map((update) => ({
    id: update.id,
    date: update.date,
    title: update.title,
    description: update.description,
    author: update.author,
    photos: update.photos || [],
  }));

  return {
    id: data.id,
    homeownerName: data.homeowner_name,
    homeownerEmail: data.homeowner_email,
    address: data.address,
    projectType: data.project_type,
    status: data.status,
    startDate: data.start_date,
    estimatedCompletion: data.estimated_completion,
    projectManager: data.project_manager,
    budget: data.budget,
    scope: data.scope,
    progress: data.progress,
    photos: data.photos || [],
    stages: data.stages || [],
    updates: updates,
    photoGalleryUrl: data.photo_gallery_url,
    shingleSelection: data.shingle_selection,
    gutterColor: data.gutter_color,
    gutterSize: data.gutter_size,
  };
};

export const updateProjectProgress = async (
  projectId: string,
  stages: ProjectStage[]
): Promise<void> => {
  const completedStages = stages.filter((s) => s.completed).length;
  const progress = Math.round((completedStages / stages.length) * 100);

  const { error } = await supabase
    .from('projects')
    .update({
      stages: stages,
      progress: progress,
      status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started',
    })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project progress:', error);
    throw error;
  }
};

export const updateProjectStages = async (
  projectId: string,
  stages: ProjectStage[]
): Promise<void> => {
  const completedStages = stages.filter((s) => s.completed).length;
  const progress = Math.round((completedStages / stages.length) * 100);

  const { error } = await supabase
    .from('projects')
    .update({
      stages: stages,
      progress: progress,
      status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started',
    })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project stages:', error);
    throw error;
  }
};

export const updateProjectStatus = async (
  projectId: string,
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold'
): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const { error: updatesError } = await supabase
    .from('project_updates')
    .delete()
    .eq('project_id', projectId);

  if (updatesError) {
    console.error('Error deleting project updates:', updatesError);
  }

  const { error: homeownerError } = await supabase
    .from('homeowners')
    .delete()
    .eq('project_id', projectId);

  if (homeownerError) {
    console.error('Error deleting homeowner:', homeownerError);
  }

  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const updatePhotoGalleryUrl = async (
  projectId: string,
  photoGalleryUrl: string
): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .update({ photo_gallery_url: photoGalleryUrl })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating photo gallery URL:', error);
    throw error;
  }
};

export const addProjectUpdate = async (
  projectId: string,
  update: {
    title: string;
    description: string;
    author: string;
    photos?: string[];
  }
): Promise<void> => {
  const { error } = await supabase
    .from('project_updates')
    .insert([
      {
        project_id: projectId,
        date: new Date().toISOString(),
        title: update.title,
        description: update.description,
        author: update.author,
        photos: update.photos || [],
      },
    ]);

  if (error) {
    console.error('Error adding project update:', error);
    throw error;
  }
};

export const getProjects = getAllProjects;