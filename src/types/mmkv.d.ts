declare module 'react-native-mmkv' {
  export interface MMKVConfiguration {
    id: string;
    encryptionKey?: string;
  }

  export class MMKV {
    constructor(configuration: MMKVConfiguration);
    
    set(key: string, value: string | number | boolean): void;
    setString(key: string, value: string): void;
    setNumber(key: string, value: number): void;
    setBoolean(key: string, value: boolean): void;
    
    getString(key: string): string | undefined;
    getNumber(key: string): number | undefined;
    getBoolean(key: string): boolean | undefined;
    
    delete(key: string): void;
    clearAll(): void;
    
    getAllKeys(): string[];
    contains(key: string): boolean;
  }
}
