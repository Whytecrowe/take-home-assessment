const { getProjects, getProjectById, addProject } = require('../config/store');

/**
 * List all projects.
 */
function listProjects(req, res, next) {
  try {
    const { status } = req.query;
    let projects = getProjects();

    if (status) {
      const statParam = status.toLowerCase();
      projects = projects.filter((p) => p.status.toString().toLowerCase() === statParam);
    }

    res.json({ success: true, data: projects, count: projects.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single project by ID.
 */
function getProject(req, res, next) {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        id: req.params.id,
      });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new project.
 */
function createProject(req, res, next) {
  try {
    const { name, chain, status } = req.body;
    const project = addProject({ name, chain, status: status || 'in-progress' });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
};
