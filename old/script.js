// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';
const STORAGE_KEY = 'careerAI_formData';

// Initialize AOS
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// Form Step Management
let currentStep = 1;
const totalSteps = 6;

// Save form data to localStorage
function saveFormData() {
    const form = document.getElementById('careerForm');
    const formData = new FormData(form);
    const data = {};
    
    // Save all form values (skip empty required fields)
    for (let [key, value] of formData.entries()) {
        // Only save non-empty values or provide defaults for numeric fields
        if (value !== '' && value !== null) {
            data[key] = value;
        }
    }
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('Form data saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Load form data from localStorage
function loadFormData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            console.log('No saved data found');
            return false;
        }
        
        const data = JSON.parse(savedData);
        const form = document.getElementById('careerForm');
        let fieldsLoaded = 0;
        
        // Populate all form fields
        for (let [key, value] of Object.entries(data)) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && value !== null && value !== undefined && value !== '') {
                input.value = value;
                fieldsLoaded++;
                
                // Update slider displays if it's a range input
                if (input.type === 'range') {
                    updateSliderDisplay(key, value);
                }
            }
        }
        
        console.log(`Form data loaded from localStorage (${fieldsLoaded} fields)`);
        return fieldsLoaded > 0;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return false;
    }
}

// Update slider display values
function updateSliderDisplay(fieldName, value) {
    const sliderMap = {
        'tech_skill_proficiency': 'techSkillVal',
        'soft_skill_proficiency': 'softSkillVal',
        'avg_course_difficulty': 'courseDiffVal',
        'avg_project_complexity': 'projectComplexVal',
        'interest_stem': 'stemVal',
        'interest_business': 'businessVal',
        'interest_arts': 'artsVal',
        'interest_design': 'designVal',
        'interest_medical': 'medicalVal',
        'interest_social_science': 'socialVal',
        'conscientiousness': 'conscVal',
        'extraversion': 'extraVal',
        'openness': 'openVal',
        'agreeableness': 'agreeVal',
        'emotional_stability': 'emotVal'
    };
    
    const displayId = sliderMap[fieldName];
    if (displayId) {
        document.getElementById(displayId).textContent = value;
    }
}

// Clear saved data
function clearSavedData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Saved data cleared');
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}

// Update slider values display
function updateValue(elementId, value) {
    document.getElementById(elementId).textContent = value;
}

// Scroll to form section
function scrollToForm() {
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

// Change form step
function changeStep(direction) {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    
    // Validate current step before moving forward
    if (direction === 1 && !validateStep(currentStep)) {
        return;
    }
    
    // Save form data when moving between steps
    saveFormData();
    
    // Hide current step
    currentStepElement.classList.remove('active');
    
    // Update step number
    currentStep += direction;
    
    // Show new step
    const newStepElement = document.getElementById(`step${currentStep}`);
    newStepElement.classList.add('active');
    
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Update button visibility
    document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : 'inline-block';
    document.getElementById('nextBtn').style.display = currentStep === totalSteps ? 'none' : 'inline-block';
    document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'inline-block' : 'none';
    
    // Scroll to top of form
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
}

// Validate current step
function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    const requiredInputs = stepElement.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;
    
    for (let input of requiredInputs) {
        // Remove previous error styling
        input.classList.remove('is-invalid');
        
        // Check if field is empty
        const isEmpty = !input.value || input.value.trim() === '';
        
        if (isEmpty) {
            input.classList.add('is-invalid');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = input;
            continue;
        }
        
        // Validate number ranges for numeric inputs
        if (input.type === 'number') {
            const value = parseFloat(input.value);
            
            // Check if it's a valid number
            if (isNaN(value)) {
                input.classList.add('is-invalid');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = input;
                continue;
            }
            
            // Check min/max constraints
            const min = input.hasAttribute('min') ? parseFloat(input.min) : null;
            const max = input.hasAttribute('max') ? parseFloat(input.max) : null;
            
            if (min !== null && value < min) {
                input.classList.add('is-invalid');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = input;
                showToast(`${input.previousElementSibling?.textContent || 'Field'} must be at least ${min}`);
                continue;
            }
            
            if (max !== null && value > max) {
                input.classList.add('is-invalid');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = input;
                showToast(`${input.previousElementSibling?.textContent || 'Field'} must be at most ${max}`);
                continue;
            }
        }
    }
    
    if (!isValid && firstInvalidField) {
        if (!firstInvalidField.classList.contains('is-invalid')) {
            showToast('Please fill in all required fields correctly');
        }
        setTimeout(() => {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
    
    return isValid;
}

// Show toast notification
function showToast(message, type = 'danger') {
    const toastElement = document.getElementById('errorToast');
    const toastBody = document.getElementById('toastMessage');
    toastBody.textContent = message;
    
    // Change toast color based on type
    toastElement.className = `toast align-items-center text-white border-0 bg-${type}`;
    
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Collect form data
function collectFormData() {
    const form = document.getElementById('careerForm');
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        // Convert numeric fields
        if (['age', 'class_10_percentage', 'class_12_percentage', 'graduate_cgpa', 'pg_cgpa',
             'courses_completed', 'total_hours_learning', 'project_count', 'experience_months',
             'conscientiousness', 'extraversion', 'openness', 'agreeableness', 'emotional_stability'].includes(key)) {
            data[key] = parseFloat(value) || 0;
        } 
        // Convert float fields
        else if (['tech_skill_proficiency', 'soft_skill_proficiency', 'avg_course_difficulty',
                  'avg_project_complexity', 'interest_stem', 'interest_business', 'interest_arts',
                  'interest_design', 'interest_medical', 'interest_social_science'].includes(key)) {
            data[key] = parseFloat(value);
        } 
        else {
            data[key] = value;
        }
    }
    
    // Calculate academic consistency (average of percentages normalized)
    const avg = (data.class_10_percentage + data.class_12_percentage + (data.graduate_cgpa * 10)) / 3;
    data.academic_consistency = (avg / 100).toFixed(2);
    
    return data;
}

// Handle form submission
document.getElementById('careerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all steps before submission
    for (let step = 1; step <= totalSteps; step++) {
        if (!validateStep(step)) {
            // Go to the invalid step
            const currentStepElement = document.getElementById(`step${currentStep}`);
            currentStepElement.classList.remove('active');
            currentStep = step;
            document.getElementById(`step${step}`).classList.add('active');
            
            // Update UI
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('prevBtn').style.display = currentStep === 1 ? 'none' : 'inline-block';
            document.getElementById('nextBtn').style.display = currentStep === totalSteps ? 'none' : 'inline-block';
            document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'inline-block' : 'none';
            
            return;
        }
    }
    
    // Save form data before submission
    saveFormData();
    
    // Collect form data
    const formData = collectFormData();
    
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    
    try {
        // Call API
        const response = await fetch(`${API_BASE_URL}/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        
        // Display results
        displayResults(result);
        
        // Scroll to results
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingSpinner').style.display = 'none';
        showToast('Failed to get prediction. Please try again.', 'danger');
    }
});

// Display results
function displayResults(data) {
    // Show results section
    document.getElementById('results-section').style.display = 'block';
    
    // Summary
    document.getElementById('predictedRole').textContent = data.summary.predicted_role || data.prediction.role;
    
    // Confidence
    const confidencePercent = parseFloat(data.prediction.confidence) || 0;
    document.getElementById('confidenceBar').style.width = confidencePercent + '%';
    document.getElementById('confidenceBar').textContent = data.prediction.confidence;
    
    // Readiness
    document.getElementById('readiness').textContent = data.summary.readiness;
    
    // Top Priority
    document.getElementById('topPriority').textContent = data.summary.top_priority;
    
    // Strengths
    displayStrengths(data.summary.your_strengths || data.your_profile.detected_skills);
    
    // Skill Gaps
    displaySkillGaps(data.skill_gaps);
    
    // Learning Roadmap
    displayLearningRoadmap(data.learning_roadmap);
    
    // Alternative Careers
    displayAlternativeCareers(data.alternative_careers);
}

// Display strengths
function displayStrengths(strengths) {
    const container = document.getElementById('strengthsList');
    container.innerHTML = '';
    
    if (!strengths || strengths.length === 0) {
        container.innerHTML = '<p class="text-muted">No strengths detected</p>';
        return;
    }
    
    strengths.forEach(skill => {
        const badge = document.createElement('span');
        badge.className = 'badge bg-success';
        badge.innerHTML = `<i class="bi bi-check-circle"></i> ${skill}`;
        container.appendChild(badge);
    });
}

// Display skill gaps
function displaySkillGaps(skillGaps) {
    const container = document.getElementById('skillGapsList');
    container.innerHTML = '';
    
    // Critical missing
    if (skillGaps.critical_missing && skillGaps.critical_missing.length > 0) {
        const heading = document.createElement('h6');
        heading.innerHTML = '<i class="bi bi-exclamation-circle"></i> Critical Missing';
        heading.className = 'text-danger mt-3';
        container.appendChild(heading);
        
        skillGaps.critical_missing.forEach(skill => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger';
            badge.textContent = skill;
            container.appendChild(badge);
        });
    }
    
    // Important missing
    if (skillGaps.important_missing && skillGaps.important_missing.length > 0) {
        const heading = document.createElement('h6');
        heading.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Important Missing';
        heading.className = 'text-warning mt-3';
        container.appendChild(heading);
        
        skillGaps.important_missing.forEach(skill => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-warning';
            badge.textContent = skill;
            container.appendChild(badge);
        });
    }
    
    // Nice to have
    if (skillGaps.nice_to_have_missing && skillGaps.nice_to_have_missing.length > 0) {
        const heading = document.createElement('h6');
        heading.innerHTML = '<i class="bi bi-info-circle"></i> Nice to Have';
        heading.className = 'text-secondary mt-3';
        container.appendChild(heading);
        
        skillGaps.nice_to_have_missing.forEach(skill => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary';
            badge.textContent = skill;
            container.appendChild(badge);
        });
    }
    
    if (!skillGaps.critical_missing?.length && !skillGaps.important_missing?.length && !skillGaps.nice_to_have_missing?.length) {
        container.innerHTML = '<p class="text-muted">No significant skill gaps detected!</p>';
    }
}

// Display learning roadmap
function displayLearningRoadmap(roadmap) {
    const container = document.getElementById('roadmapAccordion');
    container.innerHTML = '';
    
    if (!roadmap || roadmap.length === 0) {
        container.innerHTML = '<p class="text-muted">No learning roadmap available</p>';
        return;
    }
    
    roadmap.forEach((item, index) => {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        const priorityColor = item.priority === 'Critical' ? 'danger' : 
                             item.priority === 'Important' ? 'warning' : 'secondary';
        
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" 
                        data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                    <strong>${item.skill}</strong>
                    <span class="badge bg-${priorityColor} ms-2">${item.priority}</span>
                </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                 data-bs-parent="#roadmapAccordion">
                <div class="accordion-body">
                    <p><strong><i class="bi bi-clock"></i> Duration:</strong> ${item.duration}</p>
                    <p><strong><i class="bi bi-graph-up"></i> Difficulty:</strong> ${item.difficulty}</p>
                    <p><strong><i class="bi bi-book"></i> Resources:</strong></p>
                    <ul>
                        ${item.resources.map(resource => `<li>${resource}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        container.appendChild(accordionItem);
    });
}

// Display alternative careers
function displayAlternativeCareers(alternatives) {
    const container = document.getElementById('alternativeCareers');
    container.innerHTML = '';
    
    if (!alternatives || alternatives.length === 0) {
        container.innerHTML = '<p class="text-muted col-12">No alternative careers available</p>';
        return;
    }
    
    alternatives.forEach(career => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const matchScore = parseFloat(career.match_score) || 0;
        
        col.innerHTML = `
            <div class="alternative-career-card">
                <h5>${career.role}</h5>
                <div class="match-score mb-3">${career.match_score}</div>
                
                <div class="mb-3">
                    <strong><i class="bi bi-check-circle text-success"></i> You Have:</strong><br>
                    ${career.skills_you_have.map(skill => 
                        `<span class="badge bg-success">${skill}</span>`
                    ).join(' ')}
                </div>
                
                <div class="mb-3">
                    <strong><i class="bi bi-plus-circle text-primary"></i> To Learn:</strong><br>
                    ${career.skills_to_learn.map(skill => 
                        `<span class="badge bg-primary">${skill}</span>`
                    ).join(' ')}
                </div>
                
                <div>
                    <strong><i class="bi bi-lightning"></i> Effort:</strong> 
                    <span class="badge bg-info">${career.effort_required}</span>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

// Reset form
function resetForm() {
    // Ask for confirmation
    if (!confirm('Are you sure you want to clear all data and start over?')) {
        return;
    }
    
    document.getElementById('careerForm').reset();
    currentStep = 1;
    
    // Clear saved data
    clearSavedData();
    
    // Hide all steps
    for (let i = 1; i <= totalSteps; i++) {
        document.getElementById(`step${i}`).classList.remove('active');
    }
    
    // Show first step
    document.getElementById('step1').classList.add('active');
    
    // Reset progress bar
    document.getElementById('progressBar').style.width = '16.67%';
    
    // Reset buttons
    document.getElementById('prevBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'inline-block';
    document.getElementById('submitBtn').style.display = 'none';
    
    // Hide results
    document.getElementById('results-section').style.display = 'none';
    
    // Scroll to form
    scrollToForm();
    
    // Reset slider displays
    document.getElementById('techSkillVal').textContent = '0.5';
    document.getElementById('softSkillVal').textContent = '0.5';
    document.getElementById('courseDiffVal').textContent = '3';
    document.getElementById('projectComplexVal').textContent = '3';
    document.getElementById('stemVal').textContent = '0.5';
    document.getElementById('businessVal').textContent = '0.5';
    document.getElementById('artsVal').textContent = '0.5';
    document.getElementById('designVal').textContent = '0.5';
    document.getElementById('medicalVal').textContent = '0.5';
    document.getElementById('socialVal').textContent = '0.5';
    document.getElementById('conscVal').textContent = '3';
    document.getElementById('extraVal').textContent = '3';
    document.getElementById('openVal').textContent = '3';
    document.getElementById('agreeVal').textContent = '3';
    document.getElementById('emotVal').textContent = '3';
}

// Initialize: Hide prev button on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prevBtn').style.display = 'none';
    
    // Load saved data if available
    const hasData = loadFormData();
    
    // Add event listeners to remove error styling on input
    const allInputs = document.querySelectorAll('input, select');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            // Auto-save on input change (debounced)
            clearTimeout(window.autoSaveTimer);
            window.autoSaveTimer = setTimeout(() => {
                saveFormData();
            }, 1000); // Save after 1 second of no typing
        });
        input.addEventListener('change', function() {
            this.classList.remove('is-invalid');
            saveFormData(); // Save immediately on select/radio changes
        });
    });
    
    // Show data status indicator
    if (hasData) {
        showDataLoadedIndicator();
    }
});

// Show indicator that data was loaded
function showDataLoadedIndicator() {
    const formSection = document.querySelector('#form-section .card-body');
    const indicator = document.createElement('div');
    indicator.className = 'alert alert-info alert-dismissible fade show';
    indicator.innerHTML = `
        <i class="bi bi-info-circle"></i> <strong>Data Restored!</strong> Your previous form data has been loaded.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    formSection.insertBefore(indicator, formSection.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        indicator.remove();
    }, 5000);
}