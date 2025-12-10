export const translations = {
  en: {
    common: {
      home: 'Home',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      pseudo: 'Pseudo',
      firstName: 'First Name',
      lastName: 'Last Name',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      back: 'Back',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    coach: {
      dashboard: 'Coach Dashboard',
      exercises: 'Exercises',
      groups: 'Groups',
      programs: 'Programs',
      students: 'Students',
      createExercise: 'Create Exercise',
      createGroup: 'Create Group',
      createProgram: 'Create Program',
    },
    student: {
      dashboard: 'My Dashboard',
      sessions: 'My Sessions',
      programs: 'My Programs',
      badges: 'My Badges',
      stats: 'My Statistics',
    },
  },
  fr: {
    common: {
      home: 'Accueil',
      dashboard: 'Tableau de Bord',
      profile: 'Profil',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      login: 'Connexion',
      signup: "S'inscrire",
      email: 'Email',
      password: 'Mot de passe',
      pseudo: 'Pseudo',
      firstName: 'Prénom',
      lastName: 'Nom',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      back: 'Retour',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
    },
    coach: {
      dashboard: 'Tableau de Bord Entraîneur',
      exercises: 'Exercices',
      groups: 'Groupes',
      programs: 'Programmes',
      students: 'Étudiants',
      createExercise: 'Créer un Exercice',
      createGroup: 'Créer un Groupe',
      createProgram: 'Créer un Programme',
    },
    student: {
      dashboard: 'Mon Tableau de Bord',
      sessions: 'Mes Séances',
      programs: 'Mes Programmes',
      badges: 'Mes Badges',
      stats: 'Mes Statistiques',
    },
  },
}

export type Language = 'en' | 'fr'

export function getTranslation(key: string, lang: Language = 'en'): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return typeof value === 'string' ? value : key
}
