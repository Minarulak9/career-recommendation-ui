// Results Page Management - Optimized for New API
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadResults();
    
    // Download JSON button
    const downloadBtn = document.getElementById('downloadJson');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadResults);
    }
});

function loadResults() {
    const predictData = localStorage.getItem('career:lastPredict');
    const explainData = localStorage.getItem('career:lastExplain');
    
    if (!predictData && !explainData) {
        showNoResults();
        return;
    }
    
    try {
        const predict = predictData ? JSON.parse(predictData) : null;
        const explain = explainData ? JSON.parse(explainData) : null;
        
        console.log('Loaded data:', { predict, explain }); // Debug log
        
        // Show results container
        document.getElementById('resultsContainer').style.display = 'block';
        document.getElementById('noResults').style.display = 'none';
        
        // Render all sections
        if (explain && explain.summary) {
            renderSummary(explain.summary, predict);
        } else if (predict) {
            // Fallback if only predict data available
            renderSummary({
                predicted_role: predict.predicted_role,
                confidence: predict.confidence,
                match_score: 'N/A',
                seniority: 'N/A'
            }, predict);
        }
        
        if (predict && predict.all_probabilities) {
            renderProbabilityChart(predict.all_probabilities);
        }
        
        if (explain && explain.skills_detected) {
            renderSkills(explain.skills_detected);
        }
        
        if (explain && explain.prediction_reasons) {
            renderPredictionReasons(explain.prediction_reasons);
        }
        
        if (explain && explain.skill_gaps) {
            renderSkillGaps(explain.skill_gaps);
        }
        
        if (explain && explain.learning_path) {
            renderLearningPath(explain.learning_path);
        }
        
        if (explain && explain.alternative_roles) {
            renderAlternativeRoles(explain.alternative_roles);
        }
        
    } catch (error) {
        console.error('Error loading results:', error);
        window.CareerApp.showToast('Error loading results: ' + error.message, 'error');
        showNoResults();
    }
}

function showNoResults() {
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
}

function renderSummary(summary, predict) {
    const summarySection = document.getElementById('summarySection');
    
    const cards = [
        {
            title: 'Predicted Role',
            value: summary.predicted_role || predict?.predicted_role || 'N/A',
            icon: '💼',
            color: 'bg-blue-500'
        },
        {
            title: 'Confidence',
            value: summary.confidence || predict?.confidence || 'N/A',
            icon: '📊',
            color: 'bg-green-500'
        },
        {
            title: 'Match Score',
            value: summary.match_score || 'N/A',
            icon: '🎯',
            color: 'bg-purple-500'
        },
        {
            title: 'Seniority Level',
            value: summary.seniority || 'N/A',
            icon: '⭐',
            color: 'bg-orange-500'
        }
    ];
    
    summarySection.innerHTML = cards.map(card => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 card-hover">
            <div class="flex items-center justify-between mb-4">
                <div class="text-3xl">${card.icon}</div>
                <div class="${card.color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    ${card.value.toString().charAt(0)}
                </div>
            </div>
            <h4 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">${card.title}</h4>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">${card.value}</p>
        </div>
    `).join('');
    
    // Add formal explanation if available
    if (summary.formal_explanation) {
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'col-span-full mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border-l-4 border-indigo-500';
        explanationDiv.innerHTML = `
            <h4 class="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Professional Assessment
            </h4>
            <p class="text-indigo-800 dark:text-indigo-300 leading-relaxed text-base">${summary.formal_explanation}</p>
        `;
        summarySection.appendChild(explanationDiv);
    }
}

function renderProbabilityChart(probabilities) {
    const ctx = document.getElementById('probabilityChart');
    if (!ctx) return;
    
    // Destroy existing chart if any
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const labels = Object.keys(probabilities);
    const data = Object.values(probabilities).map(v => (v * 100).toFixed(1));
    
    const isDark = document.documentElement.classList.contains('dark');
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Probability (%)',
                data: data,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)'
                ],
                borderColor: [
                    'rgb(79, 70, 229)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '% probability';
                        }
                    },
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    titleColor: isDark ? '#f9fafb' : '#111827',
                    bodyColor: isDark ? '#f9fafb' : '#111827',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        color: isDark ? '#9ca3af' : '#4b5563'
                    },
                    grid: {
                        color: isDark ? '#374151' : '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: isDark ? '#9ca3af' : '#4b5563'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderSkills(skills) {
    const skillsContent = document.getElementById('skillsContent');
    
    if (!skills || skills.length === 0) {
        skillsContent.innerHTML = '<p class="text-gray-600 dark:text-gray-400">No skills detected</p>';
        return;
    }
    
    skillsContent.innerHTML = skills.map(skill => `
        <span class="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-medium text-sm hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
            ${skill}
        </span>
    `).join('');
}

function renderPredictionReasons(reasons) {
    const skillsSection = document.getElementById('skillsSection');
    
    if (!reasons || reasons.length === 0) return;
    
    // Add prediction reasons after skills
    const reasonsDiv = document.createElement('div');
    reasonsDiv.className = 'mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border-l-4 border-blue-500';
    reasonsDiv.innerHTML = `
        <h4 class="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Key Prediction Factors
        </h4>
        <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">These features had the most influence on your career prediction:</p>
        <ul class="space-y-2">
            ${reasons.map((reason, index) => `
                <li class="flex items-start text-blue-800 dark:text-blue-300 bg-white/50 dark:bg-gray-800/30 p-3 rounded-md">
                    <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        ${index + 1}
                    </span>
                    <span class="font-mono text-sm">${reason}</span>
                </li>
            `).join('')}
        </ul>
        <p class="text-xs text-blue-600 dark:text-blue-400 mt-3 italic">
            💡 These impact scores are calculated using SHAP (SHapley Additive exPlanations) analysis
        </p>
    `;
    skillsSection.appendChild(reasonsDiv);
}

function renderSkillGaps(skillGaps) {
    renderSkillCategory('criticalSkills', skillGaps.critical, 'critical');
    renderSkillCategory('importantSkills', skillGaps.important, 'important');
    renderSkillCategory('niceToHaveSkills', skillGaps.nice_to_have, 'nice-to-have');
}

function renderSkillCategory(elementId, category, type) {
    const element = document.getElementById(elementId);
    
    if (!category) {
        element.innerHTML = '<p class="text-gray-600 dark:text-gray-400">No data available</p>';
        return;
    }
    
    const hasSkills = category.have || [];
    const missingSkills = category.missing || [];
    
    let html = '';
    
    if (hasSkills.length > 0) {
        html += `
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p class="text-sm font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    You Already Have
                </p>
                <div class="flex flex-wrap gap-2">
                    ${hasSkills.map(skill => `
                        <span class="px-3 py-1.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                            ✓ ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (missingSkills.length > 0) {
        const priorityColor = type === 'critical' ? 'red' : type === 'important' ? 'yellow' : 'blue';
        html += `
            <div class="bg-${priorityColor}-50 dark:bg-${priorityColor}-900/20 p-4 rounded-lg border border-${priorityColor}-200 dark:border-${priorityColor}-800">
                <p class="text-sm font-semibold text-${priorityColor}-700 dark:text-${priorityColor}-400 mb-3 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    Skills to Learn
                </p>
                <div class="flex flex-wrap gap-2">
                    ${missingSkills.map(skill => `
                        <span class="px-3 py-1.5 bg-${priorityColor}-100 dark:bg-${priorityColor}-800 text-${priorityColor}-800 dark:text-${priorityColor}-200 rounded-full text-sm font-medium">
                            ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (hasSkills.length === 0 && missingSkills.length === 0) {
        html = '<p class="text-gray-600 dark:text-gray-400 p-4 text-center">No skills in this category</p>';
    }
    
    element.innerHTML = html;
}

function renderLearningPath(learningPath) {
    const roadmapElement = document.getElementById('learningRoadmap');
    const effortElement = document.getElementById('effortRequired');
    const projectElement = document.getElementById('recommendedProject');
    
    // Handle new API structure: skills_based_courses_projects instead of roadmap
    const roadmap = learningPath.skills_based_courses_projects || learningPath.roadmap || [];
    
    if (roadmap.length === 0) {
        roadmapElement.innerHTML = `
            <div class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="mt-2 text-gray-600 dark:text-gray-400">Great! No critical skills gaps detected.</p>
            </div>
        `;
    } else {
        // Render roadmap
        roadmapElement.innerHTML = roadmap.map((item, index) => `
            <div class="border-l-4 border-indigo-500 pl-6 pb-6 relative group hover:border-indigo-600 transition-colors">
                <div class="absolute -left-3 top-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold group-hover:scale-110 transition-transform">
                    ${index + 1}
                </div>
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                        <span class="mr-2">📚</span>
                        ${item.skill}
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                            <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                Recommended Courses
                            </p>
                            <ul class="space-y-1">
                                ${item.courses.map(course => `
                                    <li class="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                        <span class="text-indigo-500 mr-2">→</span>
                                        <span>${course}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                            <p class="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                </svg>
                                Practice Projects
                            </p>
                            <ul class="space-y-1">
                                ${item.projects.map(project => `
                                    <li class="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                        <span class="text-green-500 mr-2">→</span>
                                        <span>${project}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-2">
                        <span class="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${item.duration}
                        </span>
                        <span class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            ${item.difficulty}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Render effort and project (handle new API field names)
    effortElement.textContent = learningPath.effort_required || 'Not specified';
    projectElement.textContent = learningPath.flagship_project || learningPath.recommended_project || 'Not specified';
}

function renderAlternativeRoles(roles) {
    const rolesElement = document.getElementById('alternativeRoles');
    
    if (!roles || roles.length === 0) {
        rolesElement.innerHTML = '<p class="text-gray-600 dark:text-gray-400 col-span-3 text-center py-4">No alternative roles available</p>';
        return;
    }
    
    rolesElement.innerHTML = roles.map((role, index) => {
        const matchScore = parseInt(role.match_score) || 0;
        const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
        const color = colors[index % colors.length];
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-all card-hover border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-700">
                <div class="flex items-center mb-3">
                    <div class="${color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        ${index + 1}
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white flex-1">${role.role}</h4>
                </div>
                
                <div class="mb-2">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600 dark:text-gray-400">Match Score</span>
                        <span class="font-semibold text-gray-900 dark:text-white">${role.match_score}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div class="${color} h-full rounded-full transition-all duration-500" style="width: ${role.match_score}"></div>
                    </div>
                </div>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ${matchScore >= 50 ? '✨ Strong alternative match' : matchScore >= 30 ? '💡 Consider with upskilling' : '📚 Requires significant learning'}
                </p>
            </div>
        `;
    }).join('');
}

function downloadResults() {
    const predictData = localStorage.getItem('career:lastPredict');
    const explainData = localStorage.getItem('career:lastExplain');
    const inputData = localStorage.getItem('career:lastInput');
    
    const results = {
        input: inputData ? JSON.parse(inputData) : null,
        prediction: predictData ? JSON.parse(predictData) : null,
        analysis: explainData ? JSON.parse(explainData) : null,
        timestamp: new Date().toISOString(),
        metadata: {
            version: '2.0',
            generated_by: 'Career AI Platform'
        }
    };
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `career-prediction-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    window.CareerApp.showToast('Results downloaded successfully! 📥', 'success');
}