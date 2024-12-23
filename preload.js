const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'api', {
        generate: async (topics) => {
            try {
                return await ipcRenderer.invoke('generate', topics);
            } catch (error) {
                throw error;
            }
        },
        getRoutines: async () => {
            try {
                return await ipcRenderer.invoke('getRoutines');
            } catch (error) {
                throw error;
            }
        },
        saveAudio: (audioPath) => ipcRenderer.invoke('saveAudio', audioPath),
        saveSettings: async (settings) => ipcRenderer.invoke('saveSettings', settings),
        getSettings: async () => ipcRenderer.invoke('getSettings'),
        checkApiKeys: () => ipcRenderer.invoke('checkApiKeys')

    }
);