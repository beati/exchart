import { browser, by, element } from 'protractor'

export class AppPage {
    public async navigateTo(): Promise<any> {
        return browser.get('/')
    }

    public async getTitleText(): Promise<string> {
        return element(by.css('app-root h1')).getText()
    }
}
