// Form Management
let currentStep = 1;
const totalSteps = 6;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('careerForm');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Load saved form data if exists
    loadSavedFormData();
    
    // Next button
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateFormView();
            }
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateFormView();
        }
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }
        
        const formData = getFormData();
        
        // Save to localStorage
        localStorage.setItem('career:lastInput', JSON.stringify(formData));
        
        try {
            // Call both APIs
            const predictResult = await window.CareerApp.callPredictAPI(formData);
            const explainResult = await window.CareerApp.callExplainAPI(formData);
            
            // Redirect to results page
            window.location.href = 'results.html';
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
    // Auto-save form data on input change
    form.addEventListener('change', () => {
        const formData = getFormData();
        localStorage.setItem('career:lastInput', JSON.stringify(formData));
    });
});

function updateFormView() {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    if (currentSection) {
        currentSection.classList.add('active');
    }
    
    // Update step indicators
    document.querySelectorAll('.step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
    submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateCurrentStep() {
    const currentSection = document.querySelector(`.form-section[data-section="${currentStep}"]`);
    const inputs = currentSection.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value || input.value.trim() === '') {
            isValid = false;
            input.classList.add('border-red-500');
            
            // Remove red border after user types
            input.addEventListener('input', function() {
                this.classList.remove('border-red-500');
            }, { once: true });
        }
    });
    
    if (!isValid) {
        window.CareerApp.showToast('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

function getFormData() {
    const form = document.getElementById('careerForm');
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to object with proper types
    for (const [key, value] of formData.entries()) {
        // Fields that should be numbers
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
        
        if (numberFields.includes(key)) {
            data[key] = parseFloat(value) || 0;
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

function loadSavedFormData() {
    const savedData = localStorage.getItem('career:lastInput');
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        const form = document.getElementById('careerForm');
        
        // Populate form fields
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key];
            }
        });
        
        window.CareerApp.showToast('Previous form data loaded', 'info');
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}