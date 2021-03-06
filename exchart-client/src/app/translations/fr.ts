export const fr = {
    BudgetAcceptDialog: {
        Message: 'veux établir un budget commun avec vous',
        Refuse: 'Refuser',
        Accept: 'Accepter',
    },
    BudgetAdder: {
        Message: 'Saisissez l\'adresse email du compte à lier.',
        Label: 'Email',
        Errors: {
            Empty: 'Renseignez l\'adresse email',
            Email: 'Adresse email invalide',
        },
        Buttons: {
            Cancel: 'Annuler',
            Ok: 'Ok',
        },
    },
    BudgetAnalytics: {
        Income: 'Recettes',
        Expense: 'Dépenses',
        Balance: 'Équilibre',
        Provision: 'À provisionner',
        CategoryAmountsTable: {
            Type: 'Type',
            Category: 'Categorie',
            Amount: 'Montant',
            Ratio: 'Part',
        },
        NoMovements: 'Pas de mouvements pour cette période.',
    },
    CategoryEditor: {
        DeleteDialog: {
            Cancel: 'Annuler',
            Content: 'Êtes vous sur de vouloir supprimer la categorie',
            Yes: 'Oui',
        },
        Errors: {
            AlreadyExists: 'La catégorie existe déjà',
            Empty: 'Choisissez un nom pour la catégorie',
        },
        New: 'Nouvelle catégorie',
    },
    CategoryTypes: {
        Housing: 'Logement',
        Transport: 'Transport',
        DailyLife: 'Vie quotidienne',
        Healthcare: 'Santé',
        Leisure: 'Loisirs',
    },
    EmailVerifier: {
        Title: 'Vérification de l\'adresse email',
        Message: 'Chargement',
        Verified: 'Votre adresse email a été vérifiée avec succès.',
        Canceled: 'Votre inscription a été annulée.',
        Error: 'Vérification impossible actuellement.',
    },
    Errors: {
        Default: 'Opération impossible actuellement',
        UserNotFound: 'Utilisateur non trouvé',
        WrongPassword: 'Le mot de passe est incorrect',
    },
    LoadingIndication: {
        Loading: 'Chargement',
        LoadingFailed: 'Le chargement des données a échoué',
        Retry: 'Réessayer',
    },
    Login: {
        Title: 'Budget login',
        Email: {
            Label: 'Email',
            Empty: 'Saisissez votre adresse email',
            Invalid: 'Adresse email invalide',
        },
        Password: {
            Label: 'Mot de passe',
            Empty: 'Saissisez votre mot de passe',
        },
        Button: 'Se connecter',
        Errors: {
            BadCredentials: 'Adresse email ou mot de passe incorrect.',
            Default: 'Connexion actuellement impossible.',
        },
        Links: {
            Register: 'Inscription',
            ForgotPassword: 'Mot de passe oublié ?',
        },
    },
    MovementList: {
        RecurringMovements: {
            Title: 'Mouvements récurrents',
            Columns: {
                Recurrence: 'Récurrence',
                Start: 'Début',
                End: 'Fin',
                Amount: 'Montant',
            },
            Ongoing: 'En cours',
            Recurrence: {
                Monthly: 'Mensuel',
                Yearly: 'Annuel',
            },
        },
        Movements: {
            Title: 'Mouvements',
            Columns: {
                Month: 'Mois',
                Year: 'Année',
                Amount: 'Montant',
            },
            OverTheYear: 'Sur l\'année',
        },
        NoMovements: 'Pas de mouvements pour cette période.',
    },
    Months: {
        January: 'Janvier',
        February: 'Février',
        March: 'Mars',
        April: 'Avril',
        May: 'Mai',
        June: 'Juin',
        July: 'Juillet',
        August: 'Août',
        September: 'Septembre',
        October: 'Octobre',
        November: 'Novembre',
        December: 'Décembre',
    },
    MovementAdder: {
        Sign: {
            Revenue: 'Recette',
            Expense: 'Dépense',
        },
        With: {
            Label: 'Avec',
            Me: 'Moi seulement',
        },
        Category: {
            Label: 'Catégorie',
            Choose: 'Choisissez une catégories',
            NoCategory: 'Vous n\'avez pas encore de catégorie pour ce budget',
        },
        Amount: {
            Label: 'Montant',
            Empty: 'Renseignez le montant',
        },
        Period: {
            Label: 'Période',
            OneTime: 'Une fois',
            OverTheYear: 'Sur l\'année',
            Monthly: 'Mensuel',
            Yearly: 'Annuel',
        },
        Month: {
            Label: 'Mois',
            All: 'Toute l\'année',
        },
        Buttons: {
            Cancel: 'Annuler',
            Ok: 'Ok',
        },
    },
    PasswordResetRequester: {
        Title: 'Réinitialisation du mot de passe',
        Email: {
            Label: 'Email',
            Empty: 'Saisissez votre adresse email',
            Invalid: 'Adresse email invalide',
        },
        Button: 'Réinitialiser',
        Errors: {
            Default: 'Réinitialisation actuellement impossible.',
        },
        Done: 'Un email contenant la procédure pour réinitialiser votre mot de passe vous a été envoyer.',
    },
    PasswordResetter: {
        Title: 'Réinitialisation du mot de passe',
        Password: {
            Label: 'Mot de passe',
            Empty: 'Saissisez votre mot de passe',
        },
        Button: 'Réinitialiser',
        Errors: {
            Default: 'Réinitialisation actuellement impossible.',
        },
        Done: 'Votre mot de passe a été réinitialisé.',
        Login: 'Se connecter',
    },
    PeriodSelector: {
        Today: 'Aujourd\'hui',
        Mode: {
            Month: 'Mois',
            Year: 'Année',
        },
    },
    Register: {
        Title: 'Créer un compte',
        Email: {
            Label: 'Email',
            Empty: 'Saisissez votre adresse email',
            Invalid: 'Adresse email invalide',
        },
        Password: {
            Label: 'Mot de passe',
            Empty: 'Choisissez un mot de passe',
        },
        Name: {
            Label: 'Name',
            Empty: 'Saisissez votre nom',
        },
        Button: 'S\'inscrire',
        Errors: {
            Default: 'Inscription impossible actuellement.',
        },
        Links: {
            AlreadyRegistered: 'Déjà inscrit ?',
            Login: 'Se connecter',
        },
    },
    Tabs: {
        Data: 'Analyse',
        Movements: 'Mouvements',
        Categories: 'Catégories',
    },
    Settings: {
        ChangeName: {
            Title: 'Changement de nom',
            Label: 'Nouveau nom',
            Empty: 'Saisissez votre nouveau nom',
            Submit: 'Valider',
            Success: 'Votre nom a été changé avec succès.',
        },
        ChangeEmail: {
            Title: 'Changement d\'adresse email',
            Password: {
                Label: 'Mot de passe',
                Empty: 'Saissisez votre mot de passe',
            },
            Email: {
                Label: 'Nouvelle adresse',
                Empty: 'Saisissez votre nouvelle adresse email',
                Invalid: 'Adresse email invalide',
            },
            Submit: 'Valider',
            Success: 'Un email permettant de valider votre changement d\'adresse vous a été envoyé.',
        },
        ChangePassword: {
            Title: 'Changement de mot de passe',
            CurrentPassword: {
                Label: 'Mot de passe actuel',
                Empty: 'Saissisez votre mot de passe',
            },
            NewPassword: {
                Label: 'Nouveau mot de passe',
                Empty: 'Choisissez un mot de passe',
            },
            Submit: 'Valider',
            Success: 'Votre mot de passe a été changé avec succès.',
        },
        JointBudgetList: {
            Title: 'Budgets communs',
            NoJointBudgets: 'Pas de budget commun.',
            With: 'Avec',
            Delete: 'Êtes vous sur de vouloir supprimer votre budget commun avec',
            Cancel: 'Annuler',
            Yes: 'Oui',
        },
    },
    Shell: {
        Menu: {
            Analytics: 'Analyse',
            Main: 'Personnel',
            With: 'Avec',
            NewJointBudget: 'Nouveau budget commun',
            Settings: 'Paramètres',
            Logout: 'Se déconnecter',
        },
    },
}
