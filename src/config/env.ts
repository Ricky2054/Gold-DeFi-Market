/**
 * Environment Configuration
 * Centralizes access to environment variables with type safety and validation
 */

interface EnvConfig {
    // RPC Endpoints
    rpc: {
        ethereum: string;
        arbitrum: string;
        optimism: string;
    };

    // Aave V3 Contracts
    aave: {
        ethereum: {
            pool: string;
            dataProvider: string;
        };
        arbitrum: {
            pool: string;
            dataProvider: string;
        };
        optimism: {
            pool: string;
            dataProvider: string;
        };
    };

    // Morpho Blue Contracts
    morpho: {
        ethereum: string;
    };

    // Fluid Contracts
    fluid: {
        ethereum: string;
    };

    // Collateral Tokens
    collateral: {
        xaut: {
            ethereum: string;
            arbitrum: string;
        };
        paxg: {
            ethereum: string;
            arbitrum: string;
        };
    };

    // Borrow Assets
    borrowAssets: {
        ethereum: {
            usdc: string;
            usdt: string;
            dai: string;
            weth: string;
        };
        arbitrum: {
            usdc: string;
            usdt: string;
            dai: string;
            weth: string;
        };
    };

    // App Settings
    app: {
        debugMode: boolean;
        defaultCollateral: 'XAUT' | 'PAXG';
        minLiquidity: number;
        maxAPR: number;
        minLiquidationBuffer: number;
    };
}

/**
 * Get environment variable with validation
 */
function getEnvVar(key: string, defaultValue?: string): string {
    const value = import.meta.env[key] || defaultValue;

    if (!value) {
        console.warn(`⚠️ Environment variable ${key} is not set`);
        return '';
    }

    return value;
}

/**
 * Parse boolean from environment variable
 */
function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1';
}

/**
 * Parse number from environment variable
 */
function getEnvNumber(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Application Configuration
 * All environment variables are accessed through this object
 */
export const config: EnvConfig = {
    rpc: {
        ethereum: getEnvVar('VITE_ETHEREUM_RPC_URL', 'https://eth.llamarpc.com'),
        arbitrum: getEnvVar('VITE_ARBITRUM_RPC_URL', 'https://arbitrum.llamarpc.com'),
        optimism: getEnvVar('VITE_OPTIMISM_RPC_URL', 'https://optimism.llamarpc.com'),
    },

    aave: {
        ethereum: {
            pool: getEnvVar('VITE_AAVE_POOL_ETHEREUM', '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'),
            dataProvider: getEnvVar('VITE_AAVE_DATA_PROVIDER_ETHEREUM', '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3'),
        },
        arbitrum: {
            pool: getEnvVar('VITE_AAVE_POOL_ARBITRUM', '0x794a61358D6845594F94dc1DB02A252b5b4814aD'),
            dataProvider: getEnvVar('VITE_AAVE_DATA_PROVIDER_ARBITRUM', '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654'),
        },
        optimism: {
            pool: getEnvVar('VITE_AAVE_POOL_OPTIMISM', '0x794a61358D6845594F94dc1DB02A252b5b4814aD'),
            dataProvider: getEnvVar('VITE_AAVE_DATA_PROVIDER_OPTIMISM', '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654'),
        },
    },

    morpho: {
        ethereum: getEnvVar('VITE_MORPHO_BLUE_ETHEREUM', '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'),
    },

    fluid: {
        ethereum: getEnvVar('VITE_FLUID_LIQUIDITY_ETHEREUM', '0x52Aa899454998Be5b000Ad077a46Bbe360F4e497'),
    },

    collateral: {
        xaut: {
            ethereum: getEnvVar('VITE_XAUT_ETHEREUM', '0x68749665FF8D2d112Fa859AA293F07A622782F38'),
            arbitrum: getEnvVar('VITE_XAUT_ARBITRUM', '0x68749665FF8D2d112Fa859AA293F07A622782F38'),
        },
        paxg: {
            ethereum: getEnvVar('VITE_PAXG_ETHEREUM', '0x45804880De22913dAFE09f4980848ECE6EcbAf78'),
            arbitrum: getEnvVar('VITE_PAXG_ARBITRUM', '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429'),
        },
    },

    borrowAssets: {
        ethereum: {
            usdc: getEnvVar('VITE_USDC_ETHEREUM', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
            usdt: getEnvVar('VITE_USDT_ETHEREUM', '0xdAC17F958D2ee523a2206206994597C13D831ec7'),
            dai: getEnvVar('VITE_DAI_ETHEREUM', '0x6B175474E89094C44Da98b954EedeAC495271d0F'),
            weth: getEnvVar('VITE_WETH_ETHEREUM', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
        },
        arbitrum: {
            usdc: getEnvVar('VITE_USDC_ARBITRUM', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'),
            usdt: getEnvVar('VITE_USDT_ARBITRUM', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'),
            dai: getEnvVar('VITE_DAI_ARBITRUM', '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'),
            weth: getEnvVar('VITE_WETH_ARBITRUM', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'),
        },
    },

    app: {
        debugMode: getEnvBoolean('VITE_DEBUG_MODE', true),
        defaultCollateral: (getEnvVar('VITE_DEFAULT_COLLATERAL', 'XAUT') as 'XAUT' | 'PAXG'),
        minLiquidity: getEnvNumber('VITE_MIN_LIQUIDITY', 10000),
        maxAPR: getEnvNumber('VITE_MAX_APR', 15),
        minLiquidationBuffer: getEnvNumber('VITE_MIN_LIQUIDATION_BUFFER', 0.05),
    },
};

/**
 * Validate configuration on app startup
 */
export function validateConfig(): void {
    const errors: string[] = [];

    // Validate RPC URLs
    if (!config.rpc.ethereum) errors.push('Ethereum RPC URL is missing');
    if (!config.rpc.arbitrum) errors.push('Arbitrum RPC URL is missing');

    // Validate critical contract addresses
    if (!config.aave.ethereum.dataProvider) errors.push('Aave Ethereum Data Provider address is missing');

    if (errors.length > 0) {
        console.error('❌ Configuration validation failed:');
        errors.forEach(error => console.error(`  - ${error}`));
        console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    } else if (config.app.debugMode) {
        console.log('✅ Configuration validated successfully');
    }
}

// Log configuration in debug mode
if (config.app.debugMode) {
    console.log('🔧 Configuration loaded:', {
        rpc: config.rpc,
        debugMode: config.app.debugMode,
        defaultCollateral: config.app.defaultCollateral,
    });
}
