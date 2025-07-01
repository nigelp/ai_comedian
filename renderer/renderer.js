let currentAudioPath;
let animationState = 'idle';
let lastPeakTime = 0;
let lastEmphasisTime = 0;
let wavesurfer;

const states = {
    EMPTY: 'empty',
    GENERATING: 'generating',
    PERFORMING: 'performing',
};

// DOM Elements
const saveBtn = document.getElementById('saveAudio');
const pauseBtn = document.getElementById('pausePlay');
const menuButton = document.getElementById('menuButton');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const groqKeyInput = document.getElementById('groqKey');
const replicateApiKeyInput = document.getElementById('replicateApiKey');
const voiceSelect = document.getElementById('voiceSelect');
const modelSelect = document.getElementById('modelSelect');
const reasoningToggle = document.getElementById('reasoningToggle');
const reasoningGroup = document.getElementById('reasoningGroup');
const statusEl = document.querySelector('.generation-status');

const stageElements = {
    emptyStage: document.getElementById('emptyStage'),
    micStand: document.getElementById('micStand'),
    comedian: document.getElementById('comedian'),
};

// Voices Array - Kokoro TTS voices
const voices = [
    // American Female (af_)
    { id: 'af_alloy', name: 'Alloy', gender: 'American Female' },
    { id: 'af_aoede', name: 'Aoede', gender: 'American Female' },
    { id: 'af_bella', name: 'Bella', gender: 'American Female' },
    { id: 'af_jessica', name: 'Jessica', gender: 'American Female' },
    { id: 'af_kore', name: 'Kore', gender: 'American Female' },
    { id: 'af_nicole', name: 'Nicole', gender: 'American Female' },
    { id: 'af_nova', name: 'Nova', gender: 'American Female' },
    { id: 'af_river', name: 'River', gender: 'American Female' },
    { id: 'af_sarah', name: 'Sarah', gender: 'American Female' },
    { id: 'af_sky', name: 'Sky', gender: 'American Female' },
    // American Male (am_)
    { id: 'am_adam', name: 'Adam', gender: 'American Male' },
    { id: 'am_echo', name: 'Echo', gender: 'American Male' },
    { id: 'am_eric', name: 'Eric', gender: 'American Male' },
    { id: 'am_fenrir', name: 'Fenrir', gender: 'American Male' },
    { id: 'am_liam', name: 'Liam', gender: 'American Male' },
    { id: 'am_michael', name: 'Michael', gender: 'American Male' },
    { id: 'am_onyx', name: 'Onyx', gender: 'American Male' },
    { id: 'am_puck', name: 'Puck', gender: 'American Male' },
    // British Female (bf_)
    { id: 'bf_alice', name: 'Alice', gender: 'British Female' },
    { id: 'bf_emma', name: 'Emma', gender: 'British Female' },
    { id: 'bf_isabella', name: 'Isabella', gender: 'British Female' },
    { id: 'bf_lily', name: 'Lily', gender: 'British Female' },
    // British Male (bm_)
    { id: 'bm_daniel', name: 'Daniel', gender: 'British Male' },
    { id: 'bm_fable', name: 'Fable', gender: 'British Male' },
    { id: 'bm_george', name: 'George', gender: 'British Male' },
    { id: 'bm_lewis', name: 'Lewis', gender: 'British Male' },
];

// Helper Functions

// Clear and set stage state
function clearStageState() {
    Object.values(stageElements).forEach((el) => {
        if (el) {
            el.classList.remove('active', 'loading');
        }
    });
}

function updateStageState(state, statusText = '') {
    clearStageState();

    switch (state) {
        case states.EMPTY:
            stageElements.emptyStage?.classList.add('active');
            break;
        case states.GENERATING:
            stageElements.micStand?.classList.add('active', 'loading');
            break;
        case states.PERFORMING:
            stageElements.comedian?.classList.add('active');
            break;
    }

    if (statusEl) {
        statusEl.textContent = statusText || '';
        statusEl.classList.toggle('visible', !!statusText);
    }
}

// Populate the voice dropdown
function populateVoiceDropdown(selectedVoice) {
    voiceSelect.innerHTML = ''; // Clear existing options
    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.id;
        option.textContent = `${voice.name} (${voice.gender})`;
        voiceSelect.appendChild(option);
    });
    voiceSelect.value = selectedVoice || voices[0].id; // Set default or saved voice
}

// Show/hide reasoning toggle based on selected model
function updateReasoningVisibility() {
    const selectedModel = modelSelect.value;
    if (selectedModel === 'deepseek-r1-distill-llama-70b') {
        reasoningGroup.style.display = 'block';
    } else {
        reasoningGroup.style.display = 'none';
    }
}

// Animation State Management
function setAnimationState(state) {
    const comedianContainer = document.querySelector('.comedian-container');
    const animationStates = ['breathing', 'emphasis', 'punchline', 'idle'];
    comedianContainer.classList.remove(...animationStates);
    if (state && animationStates.includes(state)) {
        comedianContainer.classList.add(state);
    }
    animationState = state;
}

// Error Handling
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('visible');
        setTimeout(() => errorDiv.classList.remove('visible'), 5000);
    } else {
        alert(message); // Fallback if no error div is defined
    }
}

// DOMContentLoaded Event
document.addEventListener('DOMContentLoaded', async () => {
    // Check settings
    const settings = await window.api.getSettings();
    populateVoiceDropdown(settings.selectedVoice);
    groqKeyInput.value = settings.groqKey || '';
    replicateApiKeyInput.value = settings.replicateApiKey || '';
    modelSelect.value = settings.selectedModel || 'qwen/qwen3-32b';
    reasoningToggle.checked = settings.enableReasoning || false;
    
    // Update reasoning visibility based on selected model
    updateReasoningVisibility();

    // Initialise stage to empty
    updateStageState(states.EMPTY);

    // Initialise WaveSurfer
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#ff4444',
        progressColor: '#ff6666',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 1,
        height: 40,
        responsive: true,
        barRadius: 3,
        normalize: true,
    });

    // Event Handlers

    // Auto-resize textarea
    const topicInput = document.getElementById('topic');
    topicInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
    });

    // Model selection change handler
    modelSelect.addEventListener('change', updateReasoningVisibility);

    // Save settings
    saveSettings.addEventListener('click', async () => {
        const groqKey = groqKeyInput.value.trim();
        const replicateApiKey = replicateApiKeyInput.value.trim();
        const selectedVoice = voiceSelect.value;
        const selectedModel = modelSelect.value;
        const enableReasoning = reasoningToggle.checked;

        if (!groqKey || !replicateApiKey) {
            showError('Please enter both API keys.');
            return;
        }

        await window.api.saveSettings({
            groqKey,
            replicateApiKey,
            selectedVoice,
            selectedModel,
            enableReasoning
        });
        settingsModal.style.display = 'none';
    });

    // Generate routine
    const generateBtn = document.getElementById('generate');
    generateBtn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        if (!topic) {
            showError('Please enter a topic for the joke.');
            return;
        }

        generateBtn.disabled = true;
        updateStageState(states.GENERATING, 'Writing your routine...');
        pauseBtn.classList.remove('visible');

        try {
            const result = await window.api.generate(topic);
            if (result.error) throw new Error(result.error);

            currentAudioPath = result.audioPath;
            await wavesurfer.load(result.audioPath);

            updateStageState(states.PERFORMING);
            pauseBtn.classList.add('visible'); // Show pause/play button
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause'; // Set to pause initially
            wavesurfer.play();
            setAnimationState('breathing');
        } catch (error) {
            showError(error.message);
            updateStageState(states.EMPTY);
        } finally {
            generateBtn.disabled = false;
        }
    });

    // Pause/Play button
    pauseBtn.addEventListener('click', () => {
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            setAnimationState('idle');
        } else {
            wavesurfer.play();
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            setAnimationState('breathing');
        }
    });

    // Save audio button
    saveBtn.addEventListener('click', async () => {
        if (!currentAudioPath) {
            showError('Generate a routine first.');
            return;
        }

        try {
            const result = await window.api.saveAudio(currentAudioPath);
            if (result.error) throw new Error(result.error);
            alert('Audio saved successfully!');
        } catch (error) {
            showError('Error saving audio: ' + error.message);
        }
    });

    // Modal Controls
    menuButton.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeSettings.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // Update stage state on audio finish
    wavesurfer.on('finish', () => {
        updateStageState(states.EMPTY);
        setAnimationState('idle');
        pauseBtn.classList.remove('visible'); // Hide the button when finished
    });
});
