import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { LoginComponent } from './component/login/login.component'
import { MainComponent } from './component/main/main.component'
import { RegisterComponent } from './component/register/register.component'

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
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
