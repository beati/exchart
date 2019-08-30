import { TranslateLoader } from '@ngx-translate/core'

import { Observable, of } from 'rxjs'

import { en } from './en'
import { fr } from './fr'

const translations = {
    en: en,
    fr: fr,
}

export class TranslationLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
        switch (lang) {
        case 'en':
            return of(translations.en)
        case 'fr':
            return of(translations.fr)
        }
        return of(translations.en)
    }
}
