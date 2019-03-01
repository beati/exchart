import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { LoginComponent } from './components/login/login.component'
import { MainComponent } from './components/main/main.component'
import { PasswordResetterComponent } from './components/password-resetter/password-resetter.component'
import { RegisterComponent } from './components/register/register.component'

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'register',
        component: RegisterComponent,
    },
    {
        path: 'passwordreset',
        component: PasswordResetterComponent,
    },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
