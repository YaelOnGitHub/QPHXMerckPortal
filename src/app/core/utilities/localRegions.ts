

export interface Regions {
    language: string,
    region: string
}

export class LocalRegions {
    static getUserLocal(defaultValue?: string): Regions {
        if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
            return {
                language: 'en',
                region: 'us'
            };
        }
        const wn = window.navigator as any;
        let lang = wn.languages ? wn.languages[0] : defaultValue;
        lang = lang || wn.language || wn.browserLanguage || wn.userLanguage;
        const locale = new Intl.Locale(lang);
        return {
            language: locale.language,
            region: locale.region
        };
    }
}