import { ENV_CONFIG } from './environment';

export const isMockDataEnabled = () => {
    return ENV_CONFIG.USE_MOCK_DATA;
};
