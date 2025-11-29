// JSON Editor Management
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('jsonEditor');
    const formatBtn = document.getElementById('formatJson');
    const validateBtn = document.getElementById('validateJson');
    const predictBtn = document.getElementById('predictBtn');
    const explainBtn = document.getElementById('explainBtn');
    const bothBtn = document.getElementById('bothBtn');
    
    // Load saved data or default template
    loadInitialData();
    
    // Format JSON button
    formatBtn.addEventListener('click', () => {
        try {
            const data = JSON.parse(editor.value);
            editor.value = JSON.stringify(data, null, 2);
            showToast('JSON formatted successfully', 'success');
        } catch (error) {
            showToast('Invalid JSON format', 'error');
        }
    });
    
    // Validate JSON button
    validateBtn.addEventListener('click', () => {
        try {
            const data = JSON.parse(editor.value);
            if (validateData(data)) {
                showToast('JSON is valid!', 'success');
            }
        } catch (error) {
            showToast('Invalid JSON: ' + error.message, 'error');
        }
    });
    
    // Predict button
    predictBtn.addEventListener('click', async () => {
        try {
            const data = JSON.parse(editor.value);
            if (!validateData(data)) return;
            
            localStorage.setItem('career:lastInput', JSON.stringify(data));
            await callPredictAPI(data);
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });
    
    // Explain button
    explainBtn.addEventListener('click', async () => {
        try {
            const data = JSON.parse(editor.value);
            if (!validateData(data)) return;
            
            localStorage.setItem('career:lastInput', JSON.stringify(data));
            await callExplainAPI(data);
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });
    
    // Both button
    bothBtn.addEventListener('click', async () => {
        try {
            const data = JSON.parse(editor.value);
            if (!validateData(data)) return;
            
            localStorage.setItem('career:lastInput', JSON.stringify(data));
            
            // Call both APIs
            await callPredictAPI(data);
            await callExplainAPI(data);
            
            // Redirect to results
            window.location.href = 'results.html';
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });
});

function loadInitialData() {
    const editor = document.getElementById('jsonEditor');
    const savedData = localStorage.getItem('career:lastInput');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            editor.value = JSON.stringify(data, null, 2);
        } catch (error) {
            loadDefaultTemplate();
        }
    } else {
        loadDefaultTemplate();
    }
}

function loadDefaultTemplate() {
    const editor = document.getElementById('jsonEditor');
    const defaultData = {
        age: 22,
        gender: "Male",
        location: "Mumbai",
        languages_spoken: "English, Hindi",
        class_10_percentage: 85,
        class_12_percentage: 80,
        class_12_stream: "Science",
        graduate_major: "CSE",
        graduate_cgpa: 8.2,
        pg_major: "None",
        pg_cgpa: 0,
        highest_education: "Bachelors",
        academic_consistency: 0.8,
        technical_skills: "HTML, CSS, JavaScript, React",
        tech_skill_proficiency: 0.7,
        soft_skills: "Communication, Teamwork",
        soft_skill_proficiency: 0.7,
        courses_completed: 5,
        avg_course_difficulty: 3,
        total_hours_learning: 120,
        project_count: 3,
        avg_project_complexity: 3,
        experience_months: 6,
        experience_types: "Internship",
        job_level: "Entry",
        interest_stem: 0.8,
        interest_business: 0.4,
        interest_arts: 0.1,
        interest_design: 0.3,
        interest_medical: 0.1,
        interest_social_science: 0.2,
        career_preference: "Frontend Developer",
        work_preference: "Hybrid",
        preferred_industries: "IT",
        preferred_roles: "Frontend Developer",
        conscientiousness: 4,
        extraversion: 3,
        openness: 4,
        agreeableness: 3,
        emotional_stability: 4,
        current_status: "Student"
    };
    
    editor.value = JSON.stringify(defaultData, null, 2);
}

function loadSample(sampleKey) {
    const editor = document.getElementById('jsonEditor');
    const sampleData = window.SAMPLE_DATA[sampleKey];
    
    if (sampleData) {
        editor.value = JSON.stringify(sampleData, null, 2);
        showToast(`Loaded ${sampleKey} sample`, 'success');
    } else {
        showToast('Sample not found', 'error');
    }
}

function validateData(data) {
    const requiredFields = [
        'age', 'gender', 'location', 'languages_spoken',
        'class_10_percentage', 'class_12_percentage', 'class_12_stream',
        'graduate_major', 'graduate_cgpa', 'pg_major', 'pg_cgpa',
        'highest_education', 'academic_consistency',
        'technical_skills', 'tech_skill_proficiency',
        'soft_skills', 'soft_skill_proficiency',
        'courses_completed', 'avg_course_difficulty', 'total_hours_learning',
        'project_count', 'avg_project_complexity',
        'experience_months', 'experience_types', 'job_level',
        'interest_stem', 'interest_business', 'interest_arts',
        'interest_design', 'interest_medical', 'interest_social_science',
        'career_preference', 'work_preference',
        'preferred_industries', 'preferred_roles',
        'conscientiousness', 'extraversion', 'openness',
        'agreeableness', 'emotional_stability', 'current_status'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
        showToast(`Missing fields: ${missingFields.join(', ')}`, 'error');
        return false;
    }
    
    // Validate number fields
    const numberFields = [
        'age', 'class_10_percentage', 'class_12_percentage',
        'graduate_cgpa', 'pg_cgpa', 'academic_consistency',
        'tech_skill_proficiency', 'soft_skill_proficiency',
        'courses_completed', 'avg_course_difficulty', 'total_hours_learning',
        'project_count', 'avg_project_complexity', 'experience_months',
        'interest_stem', 'interest_business', 'interest_arts',
        'interest_design', 'interest_medical', 'interest_social_science',
        'conscientiousness', 'extraversion', 'openness',
        'agreeableness', 'emotional_stability'
    ];
    
    for (const field of numberFields) {
        if (typeof data[field] !== 'number') {
            showToast(`Field '${field}' must be a number`, 'error');
            return false;
        }
    }
    
    return true;
}

// Helper functions
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `
        <span class="text-xl font-bold">${icon}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(message = 'Processing...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner mx-auto mb-4"></div>
            <p class="text-gray-700 dark:text-gray-200 font-medium">${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

async function callPredictAPI(data) {
    const API_BASE_URL = 'http://127.0.0.1:8000';
    
    try {
        showLoading('Predicting your career path...');
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        hideLoading();
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get prediction');
        }
        
        const result = await response.json();
        localStorage.setItem('career:lastPredict', JSON.stringify(result));
        showToast('Prediction successful!', 'success');
        return result;
    } catch (error) {
        hideLoading();
        showToast(error.message, 'error');
        throw error;
    }
}

async function callExplainAPI(data) {
    const API_BASE_URL = 'http://127.0.0.1:8000';
    
    try {
        showLoading('Analyzing your profile...');
        const response = await fetch(`${API_BASE_URL}/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        hideLoading();
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to get explanation');
        }
        
        const result = await response.json();
        localStorage.setItem('career:lastExplain', JSON.stringify(result));
        showToast('Analysis complete!', 'success');
        return result;
    } catch (error) {
        hideLoading();
        showToast(error.message, 'error');
        throw error;
    }
}

// Make loadSample global
window.loadSample = loadSample;