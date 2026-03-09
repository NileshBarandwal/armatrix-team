/**
 * Job Listings Module
 * Dynamically renders job listings on the careers page
 */

import { fetchJobs } from '../api/airtable.js';
import { escapeHtml } from './utils.js';

// DOM element IDs
const LOADING_STATE_ID = 'loading-state';
const JOB_CONTAINER_ID = 'job-listings-container';
const ERROR_STATE_ID = 'error-state';
const EMPTY_STATE_ID = 'empty-state';
const RETRY_BUTTON_ID = 'retry-button';

/**
 * Shows the specified state and hides others
 */
function showState(stateId) {
  const states = [LOADING_STATE_ID, JOB_CONTAINER_ID, ERROR_STATE_ID, EMPTY_STATE_ID];

  states.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = id === stateId ? 'block' : 'none';
    }
  });
}

/**
 * Creates a job listing card element
 */
function createJobCard(job) {
  const link = document.createElement('a');
  link.href = `/careers/job-detail/?id=${job.id}`;
  link.className = 'career-listing';

  link.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h3>${escapeHtml(job.title)}</h3>
        <p>${escapeHtml(job.location)}</p>
      </div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: rgba(255, 255, 255, 0.95);">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;

  return link;
}

/**
 * Renders jobs to the DOM
 */
function renderJobs(jobs) {
  const container = document.getElementById(JOB_CONTAINER_ID);

  if (!container) {
    console.error('Job container not found');
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Filter out "General Application" from the list and find it for the Apply here link
  let generalApplicationJob = null;
  const regularJobs = jobs.filter(job => {
    if (job.title === 'General Application') {
      generalApplicationJob = job;
      return false;
    }
    return true;
  });

  // Update the "Apply here" link to point to the general application page
  if (generalApplicationJob) {
    const applyHereLink = document.querySelector('#general-application a');
    if (applyHereLink) {
      applyHereLink.href = '/careers/general-application/';
    }
  }

  if (regularJobs.length === 0) {
    showState(EMPTY_STATE_ID);
    // Still show the general application section even if no jobs
    const generalAppSection = document.getElementById('general-application');
    if (generalAppSection) {
      generalAppSection.style.display = 'block';
    }
    return;
  }

  // Create and append job cards (excluding General Application)
  regularJobs.forEach(job => {
    const card = createJobCard(job);
    container.appendChild(card);
  });

  showState(JOB_CONTAINER_ID);

  // Show the general application section
  const generalAppSection = document.getElementById('general-application');
  if (generalAppSection) {
    generalAppSection.style.display = 'block';
  }
}

/**
 * Loads and displays jobs
 */
async function loadJobs() {
  showState(LOADING_STATE_ID);

  try {
    const jobs = await fetchJobs();
    renderJobs(jobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
    showState(ERROR_STATE_ID);
  }
}

/**
 * Sets up retry button event listener
 */
function setupRetryButton() {
  const retryButton = document.getElementById(RETRY_BUTTON_ID);
  if (retryButton) {
    retryButton.addEventListener('click', loadJobs);
  }
}

/**
 * Initializes the job listings page
 */
function init() {
  setupRetryButton();
  loadJobs();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
