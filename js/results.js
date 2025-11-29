// Results Page Management - Shows Correct Confidence in Chart
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    loadResults();
    
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
        
        console.log('Loaded data:', { predict, explain });
        
        document.getElementById('resultsContainer').style.display = 'block';
        document.getElementById('noResults').style.display = 'none';
        
        if (explain && explain.summary) {
            renderSummary(explain.summary, predict);
        } else if (predict) {
            renderSummary({
                predicted_role: predict.predicted_role,
                confidence: predict.confidence,
                seniority: 'N/A'
            }, predict);
        }
        
        // ✅ FIX: Use skill match scores if available, otherwise use model probabilities
        if (explain && explain.model_info && explain.model_info.all_skill_matches) {
            // Use skill match scores for chart
            renderProbabilityChart(explain.model_info.all_skill_matches, true, explain.summary?.predicted_role);
        } else if (predict && predict.all_probabilities) {
            // Fallback to model probabilities
            renderProbabilityChart(predict.all_probabilities, false);
        }
        
        if (explain && explain.skills_detected) {
            renderSkills(explain.skills_detected);
        }
        
        if (explain && explain.prediction_reasons) {
            renderPredictionReasons(explain.prediction_reasons);
        }
        
        if (explain && explain.skill_gaps) {
            renderSkillGaps(explain.skill_gaps, explain.summary?.predicted_role);
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

function renderProbabilityChart(probabilities, isSkillMatch = false, predictedRole = null) {
    const ctx = document.getElementById('probabilityChart');
    if (!ctx) return;
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // ✅ FIX: Parse data correctly whether it's percentages or decimals
    const labels = Object.keys(probabilities);
    let dataValues;
    
    if (isSkillMatch) {
        // Skill match scores come as "68%" strings, convert to numbers
        dataValues = Object.values(probabilities).map(v => {
            if (typeof v === 'string') {
                return parseFloat(v.replace('%', ''));
            }
            return parseFloat(v);
        });
    } else {
        // Model probabilities come as decimals (0.15), convert to percentages
        dataValues = Object.values(probabilities).map(v => parseFloat((v * 100).toFixed(2)));
    }
    
    console.log('Chart data:', { isSkillMatch, dataValues, labels });
    
    const maxValue = Math.max(...dataValues);
    const minValue = Math.min(...dataValues);
    
    // Dynamic Y-axis scaling
    let yAxisMax;
    if (maxValue < 30) {
        yAxisMax = Math.ceil(maxValue * 1.3);
    } else if (maxValue < 70) {
        yAxisMax = Math.ceil(maxValue * 1.15);
    } else {
        yAxisMax = 100;
    }
    
    console.log('Chart scaling:', { minValue, maxValue, yAxisMax, isSkillMatch });
    
    const isDark = document.documentElement.classList.contains('dark');
    
    // ✅ FIX: Highlight the predicted role
    const backgroundColors = dataValues.map((value, index) => {
        const isPredicted = predictedRole && labels[index] === predictedRole;
        
        if (isPredicted) {
            // Predicted role gets a special color
            if (value >= 50) return 'rgba(16, 185, 129, 1)'; // Bright green
            if (value >= 30) return 'rgba(59, 130, 246, 1)'; // Bright blue
            return 'rgba(245, 158, 11, 1)'; // Bright orange
        }
        
        // Other roles get muted colors
        if (value >= 50) return 'rgba(34, 197, 94, 0.6)';
        if (value >= 30) return 'rgba(59, 130, 246, 0.6)';
        if (value >= 15) return 'rgba(245, 158, 11, 0.6)';
        return 'rgba(239, 68, 68, 0.6)';
    });
    
    const borderColors = dataValues.map((value, index) => {
        const isPredicted = predictedRole && labels[index] === predictedRole;
        if (isPredicted) return 'rgba(16, 185, 129, 1)';
        
        if (value >= 50) return 'rgb(34, 197, 94)';
        if (value >= 30) return 'rgb(59, 130, 246)';
        if (value >= 15) return 'rgb(245, 158, 11)';
        return 'rgb(239, 68, 68)';
    });
    
    // Thicker border for predicted role
    const borderWidths = dataValues.map((_, index) => {
        return (predictedRole && labels[index] === predictedRole) ? 3 : 2;
    });
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: isSkillMatch ? 'Skill Match (%)' : 'Model Probability (%)',
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: borderWidths,
                borderRadius: 8,
                barPercentage: 0.8,
                categoryPercentage: 0.9,
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
                    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#fff' : '#000',
                    bodyColor: isDark ? '#d1d5db' : '#374151',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            const label = context[0].label;
                            const isPredicted = predictedRole && label === predictedRole;
                            return isPredicted ? `${label} ⭐ (Recommended)` : label;
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            const type = isSkillMatch ? 'Skill Match' : 'Model Confidence';
                            let interpretation = '';
                            
                            if (value >= 50) interpretation = ' - Strong match ✅';
                            else if (value >= 30) interpretation = ' - Good match 👍';
                            else if (value >= 15) interpretation = ' - Moderate match 💡';
                            else interpretation = ' - Low match 📚';
                            
                            return `${type}: ${value.toFixed(1)}%${interpretation}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: isSkillMatch ? 'Skill Match Scores by Role' : 'Model Confidence by Role',
                    color: isDark ? '#e5e7eb' : '#1f2937',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 20
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: yAxisMax,
                    ticks: {
                        color: isDark ? '#9ca3af' : '#6b7280',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        callback: function(value) {
                            return value.toFixed(0) + '%';
                        },
                        stepSize: yAxisMax <= 30 ? 5 : yAxisMax <= 60 ? 10 : 20
                    },
                    grid: {
                        color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: isSkillMatch ? 'Skill Match Level' : 'Confidence Level',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    }
                },
                x: {
                    ticks: {
                        color: isDark ? '#9ca3af' : '#6b7280',
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
    
    // Add interpretation guide below chart
    const chartSection = document.getElementById('predictionSection');
    let guideDiv = chartSection.querySelector('.chart-guide');
    if (!guideDiv) {
        guideDiv = document.createElement('div');
        guideDiv.className = 'chart-guide mt-6';
        chartSection.appendChild(guideDiv);
    }
    
    guideDiv.innerHTML = `
        ${isSkillMatch ? `
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div class="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Chart Type:</strong> Skill Match Analysis<br>
                        <span class="text-xs text-blue-600 dark:text-blue-300">Shows how well your skills align with each role's requirements</span>
                    </div>
                </div>
            </div>
        ` : ''}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="w-4 h-4 bg-green-500 rounded"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">50%+ Strong</span>
            </div>
            <div class="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="w-4 h-4 bg-blue-500 rounded"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">30-49% Good</span>
            </div>
            <div class="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div class="w-4 h-4 bg-orange-500 rounded"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">15-29% Moderate</span>
            </div>
            <div class="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div class="w-4 h-4 bg-red-500 rounded"></div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">&lt;15% Low</span>
            </div>
        </div>
    `;
}

// [Rest of the functions remain the same - renderSkills, renderPredictionReasons, etc.]
// Copy all remaining functions from the previous results_fixed_chart.js

function renderSkills(skills) {
    const skillsContent = document.getElementById('skillsContent');
    
    if (!skills || skills.length === 0) {
        skillsContent.innerHTML = '<p class="text-gray-600 dark:text-gray-400 w-full text-center py-4">No skills detected</p>';
        return;
    }
    
    const sortedSkills = [...skills].sort();
    
    skillsContent.innerHTML = sortedSkills.map(skill => `
        <span class="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
              onclick="exploreLearningPath('${skill.replace(/'/g, "\\'")}')">
            ${skill}
        </span>
    `).join('');
}

function renderPredictionReasons(reasons) {
    const reasonsHTML = reasons.map(reason => `
        <li class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-gray-700 dark:text-gray-300">${reason}</span>
        </li>
    `).join('');
    
    let reasonsSection = document.getElementById('predictionReasonsSection');
    if (!reasonsSection) {
        const predictionSection = document.getElementById('predictionSection');
        reasonsSection = document.createElement('div');
        reasonsSection.id = 'predictionReasonsSection';
        reasonsSection.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8';
        predictionSection.after(reasonsSection);
    }
    
    reasonsSection.innerHTML = `
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg class="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Key Factors in Recommendation
        </h3>
        <ul class="space-y-3">
            ${reasonsHTML}
        </ul>
    `;
}

function renderSkillGaps(skillGaps, predictedRole) {
    renderSkillCategory('criticalSkills', skillGaps.critical, 'critical');
    renderSkillCategory('importantSkills', skillGaps.important, 'important');
    renderSkillCategory('niceToHaveSkills', skillGaps.nice_to_have, 'nice');
    
    if (predictedRole) {
        addExploreRoleButton(predictedRole);
    }
}

function addExploreRoleButton(role) {
    const skillGapsSection = document.getElementById('skillGapsSection');
    
    let exploreButtonDiv = document.getElementById('exploreRoleButton');
    if (!exploreButtonDiv) {
        exploreButtonDiv = document.createElement('div');
        exploreButtonDiv.id = 'exploreRoleButton';
        exploreButtonDiv.className = 'mt-6';
        skillGapsSection.appendChild(exploreButtonDiv);
    }
    
    exploreButtonDiv.innerHTML = `
        <button onclick="exploreRoleSkills('${role.replace(/'/g, "\\'")})" 
                class="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span>Explore All Skills for ${role}</span>
        </button>
    `;
}

async function exploreRoleSkills(role) {
    try {
        window.CareerApp.showLoading(`Loading skills for ${role}...`);
        
        const response = await fetch(`${window.CareerApp.API_BASE_URL}/skills/${encodeURIComponent(role)}`);
        
        if (!response.ok) {
            throw new Error('Failed to load role skills');
        }
        
        const roleSkills = await response.json();
        window.CareerApp.hideLoading();
        
        showRoleSkillsModal(role, roleSkills);
        
    } catch (error) {
        window.CareerApp.hideLoading();
        window.CareerApp.showToast(`Error: ${error.message}`, 'error');
    }
}

function showRoleSkillsModal(role, skillsData) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onclick="this.parentElement.parentElement.remove()"></div>
            
            <div class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <h3 class="text-2xl font-bold text-white flex items-center justify-between">
                        <span>Skills Required for ${role}</span>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </span>
                </div>
                
                <div class="px-6 py-4 max-h-96 overflow-y-auto">
                    ${['critical', 'important', 'nice_to_have'].map(priority => `
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold mb-3 flex items-center
                                ${priority === 'critical' ? 'text-red-600 dark:text-red-400' : 
                                  priority === 'important' ? 'text-yellow-600 dark:text-yellow-400' : 
                                  'text-blue-600 dark:text-blue-400'}">
                                ${priority === 'critical' ? '🔴 Critical' : 
                                  priority === 'important' ? '🟡 Important' : 
                                  '🔵 Nice to Have'}
                            </h4>
                            <div class="flex flex-wrap gap-2">
                                ${(skillsData[priority] || []).map(skill => `
                                    <span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                                          onclick="exploreLearningPath('${skill.replace(/'/g, "\\'")}'); this.closest('.fixed').remove();">
                                        ${skill}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-medium">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function exploreLearningPath(skill) {
    try {
        window.CareerApp.showLoading(`Loading learning resources for ${skill}...`);
        
        const response = await fetch(`${window.CareerApp.API_BASE_URL}/learning-path/${encodeURIComponent(skill)}`);
        
        if (!response.ok) {
            throw new Error('Failed to load learning path');
        }
        
        const learningData = await response.json();
        window.CareerApp.hideLoading();
        
        showLearningPathModal(skill, learningData);
        
    } catch (error) {
        window.CareerApp.hideLoading();
        window.CareerApp.showToast(`Error: ${error.message}`, 'error');
    }
}

function showLearningPathModal(skill, learningData) {
    if (learningData.error) {
        window.CareerApp.showToast(`No learning resources found for "${skill}"`, 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 overflow-y-auto';
    modal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onclick="this.parentElement.parentElement.remove()"></div>
            
            <div class="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div class="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
                    <h3 class="text-2xl font-bold text-white flex items-center justify-between">
                        <span>📚 Learn: ${skill}</span>
                        <button onclick="this.closest('.fixed').remove()" class="text-white hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </span>
                </div>
                
                <div class="px-6 py-4">
                    <div class="mb-4">
                        <h4 class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            Recommended Courses
                        </h4>
                        <ul class="space-y-2">
                            ${(learningData.courses || []).map(course => `
                                <li class="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                    <span class="text-indigo-500 mr-2">→</span>
                                    <span>${course}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                            </svg>
                            Practice Projects
                        </h4>
                        <ul class="space-y-2">
                            ${(learningData.projects || []).map(project => `
                                <li class="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                    <span class="text-green-500 mr-2">→</span>
                                    <span>${project}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 mt-4">
                        <span class="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                            ⏱️ ${learningData.duration || 'N/A'}
                        </span>
                        <span class="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                            📊 ${learningData.difficulty || 'N/A'}
                        </span>
                    </div>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 font-medium">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function renderSkillCategory(elementId, categoryData, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const have = categoryData.have || [];
    const missing = categoryData.missing || [];
    
    let html = '';
    
    if (have.length > 0) {
        html += `
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <h5 class="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    ✅ You Have (${have.length})
                </h5>
                <div class="flex flex-wrap gap-2">
                    ${have.map(skill => `
                        <span class="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm">
                            ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (missing.length > 0) {
        html += `
            <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
                <h5 class="text-sm font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    ❌ Need to Learn (${missing.length})
                </h5>
                <div class="flex flex-wrap gap-2">
                    ${missing.map(skill => `
                        <span class="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full text-sm cursor-pointer hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                              onclick="exploreLearningPath('${skill.replace(/'/g, "\\'")}')">
                            ${skill}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    if (!html) {
        html = '<p class="text-gray-600 dark:text-gray-400 p-4 text-center">No skills in this category</p>';
    }
    
    element.innerHTML = html;
}

function renderLearningPath(learningPath) {
    const roadmapElement = document.getElementById('learningRoadmap');
    const effortElement = document.getElementById('effortRequired');
    const projectElement = document.getElementById('recommendedProject');
    
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
            <div class="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm hover:shadow-md transition-all card-hover border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                 onclick="exploreRoleSkills('${role.role.replace(/'/g, "\\'")}')">
                <div class="flex items-center mb-3">
                    <div class="${color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        ${index + 1}
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 dark:text-white flex-1">${role.role}</h4>
                </div>
                
                <div class="mb-2">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600 dark:text-gray-400">Skill Match</span>
                        <span class="font-semibold text-gray-900 dark:text-white">${role.match_score}</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div class="${color} h-full rounded-full transition-all duration-500" style="width: ${role.match_score}"></div>
                    </div>
                </div>
                
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    ${matchScore >= 50 ? '✨ Strong alternative match' : matchScore >= 30 ? '💡 Consider with upskilling' : '📚 Requires significant learning'}
                </p>
                
                <p class="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
                    Click to explore required skills →
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
            version: '2.1',
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

window.exploreRoleSkills = exploreRoleSkills;
window.exploreLearningPath = exploreLearningPath;