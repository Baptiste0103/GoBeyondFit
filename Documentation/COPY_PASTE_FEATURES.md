# 📋 Program Builder - Copy/Paste Features

## ✨ Nouvelles Fonctionnalités

### 1. **Use Template Program**
Au top du program builder, un bouton **"Use Template"** permet de:
- Charger tous les programmes existants
- Choisir un programme comme template
- Copier toute sa structure (blocs, semaines, séances, exercices)
- Régénérer automatiquement tous les IDs
- Commencer un nouveau programme basé sur celui-ci

**Accès:** Bouton vert en haut du formulaire principal

---

### 2. **Copy/Paste Sessions (Séances)**

#### 🔵 Copy Session
- Bouton **"Copy"** sur chaque séance
- Copie la séance entière (titre + tous les exercices + configuration)
- Feedback visuel: ✅ "Séance copiée!"
- Raccourci clavier: **Ctrl+C** (dans le contexte de la séance)

#### 🟠 Paste Session
- Bouton **"Paste"** apparaît quand une séance est copiée
- Disponible pour chaque semaine
- Colle la séance avec le titre modifié en "Session (copie)"
- Raccourci clavier: **Ctrl+V** (dans le contexte de la semaine)

**Exemple d'utilisation:**
```
Semaine 1
├─ Séance 1: Pull (contient 5 exercices)
│  └─ [Copy] [Paste] [Hide/Add]
└─ Séance 2
   └─ Click [Paste] → Crée "Séance 1 (copie)" avec tous les exercices

Résultat:
├─ Séance 1: Pull
├─ Séance 2
└─ Séance 1 (copie): Pull (identique)
```

---

### 3. **Copy/Paste Blocks (Blocs)**

#### 🔵 Copy Block
- Bouton **"Copy"** dans le header de chaque bloc
- Copie le bloc entier (toutes les semaines, séances, exercices)
- Feedback visuel: ✅ "Bloc copié!"
- Raccourci clavier: **Ctrl+C** (dans le contexte du bloc)

#### 🟠 Paste Block
- Bouton **"Paste Block"** en haut, quand un bloc est copié
- Ajoute un nouveau bloc à la fin du programme
- Titre automatiquement modifié en "Block X (copie)"
- Raccourci clavier: **Ctrl+V** (au niveau programme)

**Exemple d'utilisation:**
```
Programme Initial:
├─ BLOC 1 (3 semaines)
│  └─ [Copy] [Delete]
└─ BLOC 2 (4 semaines)

Après Click [Copy] sur BLOC 1:
├─ BLOC 1 (3 semaines)
├─ BLOC 2 (4 semaines)
└─ [Paste Block (Ctrl+V)]

Après Click [Paste]:
├─ BLOC 1 (3 semaines)
├─ BLOC 2 (4 semaines)
└─ BLOC 1 (copie) (3 semaines - identique)
```

---

## ⌨️ Raccourcis Clavier

| Action | Raccourci | Contexte |
|--------|-----------|----------|
| Copier une séance | Ctrl+C | Dans une séance |
| Coller une séance | Ctrl+V | Dans une semaine |
| Copier un bloc | Ctrl+C | Dans un bloc |
| Coller un bloc | Ctrl+V | Au niveau programme |

**Fonctionnement des raccourcis:**
- Les attributs `data-clipboard-*` marquent les zones interactives
- Au focus sur un élément avec ces attributs, Ctrl+C/V fonctionnent
- Cross-platform: Ctrl sur Windows/Linux, Cmd sur Mac (utilise metaKey)

---

## 📊 Cas d'Usage Courants

### Scenario 1: Répéter une séance Pull dans la même semaine
```
Semaine 1
├─ Séance 1: Pull (Muscle-up, Pull-up, Biceps curl)
│  └─ [Copy]
└─ Semaine 1
   └─ [Paste] → Crée une 2e séance Pull identique
```

### Scenario 2: Dupliquer une semaine entière
```
Bloc 1
├─ Semaine 1 (Session Pull, Session Push)
│  └─ [Copy] sessions
└─ Semaine 2
   └─ [Paste] chaque session copiée
```

### Scenario 3: Réutiliser un programme existant
```
1. Clic "Use Template"
2. Sélectionne programme "Strength Training"
3. Tout est copié → Crée "Strength Training (from template)"
4. Peut être modifié et sauvegardé comme nouveau programme
```

---

## 🎯 Détails Techniques

### États Managés:
- `clipboardSession`: Stocke la séance copiée
- `clipboardBlock`: Stocke le bloc copié
- `availablePrograms`: Liste des programmes pour template
- `showTemplateModal`: Affichage du modal de sélection

### Fonctions Implémentées:
- `copySession(session)`: Copie + feedback
- `pasteSession(blockId, weekId)`: Colle + régénère ID
- `copyBlock(block)`: Copie + feedback
- `pasteBlock()`: Colle au niveau programme
- `loadAvailablePrograms()`: Charge les programmes
- `useTemplateProgram(id)`: Charge et applique un template

### Évenements Clavier:
- Écouteur global `keydown` sur Ctrl/Cmd + C/V
- Détecte contexte via attributs `data-clipboard-*`
- Prévention de défaut pour éviter comportement du navigateur

---

## 💾 Notes Importantes

1. **IDs Régénérés**: À chaque copie/colle, les IDs sont régénérés avec timestamps
2. **Titles Modifiés**: Les titres copiés sont automatiquement renommés " (copie)"
3. **État du Clipboard**: Persist pendant toute la session (tant que la page est ouverte)
4. **Clear Automatique**: Le clipboard se vide si on navigue ailleurs ou qu'on ferme la page

---

## 🚀 Activation des Fonctionnalités

Toutes les fonctionnalités sont **actives par défaut**:
- Boutons visibles et fonctionnels
- Raccourcis clavier opérationnels
- Modal template inclus
- Pas d'import/configuration supplémentaire requise

---

## 📱 UI Elements

### Boutons Visuels:
- **Copy**: 🔵 Bleu (bg-blue-500)
- **Paste**: 🟠 Orange (bg-orange-500)  
- **Use Template**: 🟢 Vert (bg-green-600)
- **Delete**: 🔴 Rouge (Trash2 icon)

### Placement:
- **Block**: En haut à droite du bloc
- **Session**: À côté du titre de la séance
- **Program**: En haut du formulaire principal

---

## ✅ Tests Recommandés

1. ✓ Copy puis Paste une session
2. ✓ Vérifier que tous les exercices sont copiés
3. ✓ Copy puis Paste un bloc entier
4. ✓ Utiliser Ctrl+C/V pour copier une séance
5. ✓ Charger un programme comme template
6. ✓ Sauvegarder un programme créé à partir d'un template
7. ✓ Copier plusieurs fois (vérifier IDs uniques)
8. ✓ Vérifier les feedback visuels (✅ messages)

---

**Status:** ✅ Implémenté et testé  
**Frontend Build:** ✅ Passant  
**Tous les raccourcis clavier:** ✅ Fonctionnels
