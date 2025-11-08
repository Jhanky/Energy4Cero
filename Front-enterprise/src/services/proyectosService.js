import apiService from './api';
import projectService from './projectService';
import milestoneService from './milestoneService';
import documentService from './documentService';
import stateService from './stateService';

class ProyectosService {
  constructor() {
    this.projectService = projectService;
    this.milestoneService = milestoneService;
    this.documentService = documentService;
    this.stateService = stateService;
  }

  // Métodos para proyectos
  async getProjects(params = {}) {
    return await this.projectService.getProjects(params);
  }

  async getProject(id) {
    return await this.projectService.getProject(id);
  }

  async createProject(projectData) {
    return await this.projectService.createProject(projectData);
  }

  async updateProject(id, projectData) {
    return await this.projectService.updateProject(id, projectData);
  }

  async deleteProject(id) {
    return await this.projectService.deleteProject(id);
  }

  async updateProjectState(id, stateData) {
    return await this.projectService.updateProjectState(id, stateData);
  }

  async getProjectStatistics() {
    return await this.projectService.getProjectStatistics();
  }

  // Métodos para hitos (milestones)
  async getMilestones(projectId, params = {}) {
    return await this.projectService.getMilestones(projectId, params);
  }

  async getMilestone(projectId, milestoneId) {
    return await this.projectService.getMilestone(projectId, milestoneId);
  }

  async createMilestone(projectId, milestoneData) {
    return await this.milestoneService.createMilestone(milestoneData);
  }

  async updateMilestone(projectId, milestoneId, milestoneData) {
    return await this.milestoneService.updateMilestone(milestoneId, milestoneData);
  }

  async deleteMilestone(projectId, milestoneId) {
    return await this.projectService.deleteMilestone(projectId, milestoneId);
  }



  async getMilestoneTypes() {
    return await this.milestoneService.getMilestoneTypes();
  }

  // Métodos para documentos
  async getDocuments(projectId, params = {}) {
    return await this.projectService.getDocuments(projectId, params);
  }

  async getDocument(projectId, documentId) {
    return await this.projectService.getDocument(projectId, documentId);
  }

  async createDocument(projectId, documentData) {
    return await this.documentService.createDocument(documentData);
  }

  async updateDocument(projectId, documentId, documentData) {
    return await this.documentService.updateDocument(documentId, documentData);
  }

  async deleteDocument(projectId, documentId) {
    return await this.projectService.deleteDocument(projectId, documentId);
  }

  async downloadDocument(projectId, documentId) {
    return await this.projectService.downloadDocument(projectId, documentId);
  }

  async uploadDocument(projectId, documentData) {
    return await this.documentService.createDocument(documentData);
  }

  async uploadMilestoneDocument(projectId, milestoneId, documentData) {
    return await this.milestoneService.uploadMilestoneDocument(projectId, milestoneId, documentData);
  }

  async getDocumentTypes() {
    return await this.documentService.getDocumentTypes();
  }

  // Métodos para estados
  async getProjectStates() {
    return await this.stateService.getProjectStates();
  }

  async getMilestoneStates() {
    return await this.stateService.getMilestoneStates();
  }

  async updateProjectStateById(projectId, stateData) {
    return await this.stateService.updateProjectState(projectId, stateData);
  }



  async getProjectStateTimeline(projectId) {
    return await this.stateService.getProjectStateTimeline(projectId);
  }

  async getAvailableStateTransitions(projectId, currentStateId) {
    return await this.stateService.getAvailableStateTransitions(projectId, currentStateId);
  }

  async validateStateTransition(projectId, fromStateId, toStateId) {
    return await this.stateService.validateStateTransition(projectId, fromStateId, toStateId);
  }

  // Métodos para estadísticas
  async getProjectDocumentsCount(projectId) {
    const response = await this.projectService.getProjectDocuments(projectId);
    return response.data?.length || 0;
  }

  async getProjectMilestonesCount(projectId) {
    const response = await this.projectService.getProjectMilestones(projectId);
    return response.data?.length || 0;
  }

  async getMilestoneDocumentsCount(milestoneId) {
    const response = await this.documentService.getDocumentsByMilestone(milestoneId);
    return response.data?.length || 0;
  }

  // Métodos para tipos
  async getProjectStateOptions() {
    const states = await this.getProjectStates();
    return states.data?.map(state => ({
      value: state.id,
      label: state.name
    })) || [];
  }

  async getMilestoneTypeOptions() {
    const types = await this.getMilestoneTypes();
    return types.data?.map(type => ({
      value: type.id,
      label: type.name
    })) || [];
  }

  async getDocumentTypeOptions() {
    const types = await this.getDocumentTypes();
    return types.data?.map(type => ({
      value: type.id,
      label: type.name
    })) || [];
  }

  // Métodos auxiliares para formateo
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Métodos para búsqueda
  async searchProjects(query, params = {}) {
    const searchParams = { ...params, search: query };
    return await this.getProjects(searchParams);
  }

  async searchDocuments(projectId, query, params = {}) {
    const searchParams = { ...params, search: query };
    return await this.getDocuments(projectId, searchParams);
  }

  async searchMilestones(projectId, query, params = {}) {
    const searchParams = { ...params, search: query };
    return await this.getMilestones(projectId, searchParams);
  }
}

const proyectosService = new ProyectosService();
export default proyectosService;