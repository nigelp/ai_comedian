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
const elevenLabsKeyInput = document.getElementById('elevenLabsKey');
const voiceSelect = document.getElementById('voiceSelect');
const statusEl = document.querySelector('.generation-status');

const stageElements = {
    emptyStage: document.getElementById('emptyStage'),
    micStand: document.getElementById('micStand'),
    comedian: document.getElementById('comedian'),
};

// Voices Array
const voices = [
    { id: 'wLoW00IP5kfH8oiOBAPp', name: 'Grant', gender: 'Male' },
    { id: 'NFG5qt843uXKj4pFvR7C', name: 'Adam', gender: 'Male' },
    { id: 'dACWdVrMuoWEQzp6Uz5e', name: 'Ryan', gender: 'Male' },
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
    elevenLabsKeyInput.value = settings.elevenLabsKey || '';

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

    // Save settings
    saveSettings.addEventListener('click', async () => {
        const groqKey = groqKeyInput.value.trim();
        const elevenLabsKey = elevenLabsKeyInput.value.trim();
        const selectedVoice = voiceSelect.value;

        if (!groqKey || !elevenLabsKey) {
            showError('Please enter both API keys.');
            return;
        }

        await window.api.saveSettings({ groqKey, elevenLabsKey, selectedVoice });
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
